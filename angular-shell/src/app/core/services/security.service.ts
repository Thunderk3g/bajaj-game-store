import { Inject, Injectable } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import {
  GamificationStoreService,
} from './gamification-store.service';
import { FederationService } from './federation.service';

// ── Constants ──────────────────────────────────────────────────
const AES_KEY_B64 = 'TKgxQ/OeHM6XRXslJ/PbMyOCOu24cH7h4CwpyzQ2T3U=';

// ── Service ─────────────────────────────────────────────────────

@Injectable({
  providedIn: 'root',
})
export class SecurityService {
  private token: string | null = null;
  private payload: any | null = null;

  constructor(
    private router: Router,
    private store: GamificationStoreService,
    private federationService: FederationService,
    @Inject(APP_BASE_HREF) private baseHref: string,
  ) { }

  /**
   * Normalize a token that may have been corrupted in transit.
   *
   * Base64 uses '+' and '/'. When a URL is redirected (e.g. from marketing
   * assist), an intermediate hop can decode '%2B' -> '+', and a downstream
   * URL parser then turns '+' into a space. Base64 never contains spaces, so
   * any space we see was almost certainly a '+'. Restore it.
   */
  private normalizeToken(rawToken: string): string {
    if (!rawToken) return rawToken;
    const normalized = rawToken.replace(/ /g, '+');
    if (normalized !== rawToken) {
      const spacesFixed = (rawToken.match(/ /g) || []).length;
      console.warn(
        `[TokenDecrypter] ⚠ Token contained ${spacesFixed} space(s) — restored to '+'. ` +
        `This usually means the URL was redirected and '+' was corrupted to space. ` +
        `THIS IS THE LIKELY CAUSE of the "expired token" error on prod.`,
      );
    }
    return normalized;
  }

  /**
   * Decrypt AES-256 ECB payload using CryptoJS.
   */
  private decryptAES(encryptedB64: string, keyB64: string): any {
    console.log(
      `[TokenDecrypter] decryptAES() input — length=${encryptedB64?.length ?? 0}, ` +
      `hasSpace=${/ /.test(encryptedB64 || '')}, hasPlus=${/\+/.test(encryptedB64 || '')}, ` +
      `hasPercent=${/%/.test(encryptedB64 || '')}`,
    );
    try {
      const key = CryptoJS.enc.Base64.parse(keyB64);
      const decrypted = CryptoJS.AES.decrypt(encryptedB64, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      });

      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
      console.log(
        `[TokenDecrypter] decryptAES() decrypted text length=${decryptedText?.length ?? 0}`,
      );
      if (!decryptedText) {
        console.error(
          '[TokenDecrypter] ❌ Decryption produced EMPTY text — token is malformed/corrupted ' +
          'or was encrypted with a different key than this environment expects.',
        );
        return null;
      }

      const parsed = JSON.parse(decryptedText);
      console.log('[TokenDecrypter] ✅ Decrypted payload:', parsed);
      return parsed;
    } catch (e) {
      console.error(
        '[TokenDecrypter] ❌ decryptAES() threw — JSON parse failed or invalid ciphertext:',
        e,
      );
      return null;
    }
  }

  /**
   * Authenticate and extract gameId
   * @param token  Encrypted AES string from query parameter
   * @returns      gameId if valid, null if invalid/expired
   */
  async authenticateWithToken(token: string): Promise<string | null> {
    console.log(
      `[TokenDecrypter] authenticateWithToken() called — raw token length=${token?.length ?? 0}`,
    );
    try {
      // Repair '+' → space corruption that can happen during URL redirects.
      const normalizedToken = this.normalizeToken(token);
      this.token = normalizedToken;

      // Real AES decryption
      this.payload = this.decryptAES(normalizedToken, AES_KEY_B64);

      if (!this.payload) {
        console.error(
          '[TokenDecrypter] ❌ AUTH FAILED at: decryption (payload is null). ' +
          'Reported to user as "expired token".',
        );
        this.clearAuthentication();
        return null;
      }

      // ── Extract required claims ──
      // Based on real payload: { game_id, emp_id, emp_name, emp_mobile, location, zone }
      const empId = this.payload.emp_id;
      const gameIdApi = this.payload.game_id;
      console.log(
        `[TokenDecrypter] Extracted claims — emp_id=${empId}, game_id=${gameIdApi}`,
      );

      if (!empId) {
        console.error('[TokenDecrypter] ❌ AUTH FAILED at: missing emp_id in payload.');
        this.clearAuthentication();
        return null;
      }

      if (!gameIdApi) {
        console.error('[TokenDecrypter] ❌ AUTH FAILED at: missing game_id in payload.');
        this.clearAuthentication();
        return null;
      }

      // Resolve the internal game ID (e.g., GAME_001 -> life-goals)
      const internalGameId = this.federationService.resolveApiGameId(gameIdApi);
      const manifest = this.federationService.getGameManifest(internalGameId);
      console.log(
        `[TokenDecrypter] Game resolution — api game_id=${gameIdApi} → internalGameId=${internalGameId}, ` +
        `manifestFound=${!!manifest}`,
      );

      if (!manifest) {
        console.error(
          `[TokenDecrypter] ❌ AUTH FAILED at: game "${gameIdApi}" (internal "${internalGameId}") ` +
          `not found in federation manifest. Is this game registered/deployed in this environment?`,
        );
        this.clearAuthentication();
        return null;
      }

      // ── Construct store objects ──
      const salesPerson = {
        id: empId,
        name: this.payload.emp_name || 'User',
        region: this.payload.location || 'NA',
        mobile: this.payload.emp_mobile || '',
        zone: this.payload.zone || '',
      };

      const gameDetails = {
        id: internalGameId,
        desc: manifest.displayName,
        url: this.baseHref + manifest.remoteEntry.substring(0, manifest.remoteEntry.lastIndexOf('/') + 1) + 'index.html',
        thumbnail: ''
      };

      // ── Push to centralized store ──
      this.store.setState(salesPerson, gameDetails, normalizedToken);

      console.log(
        `[TokenDecrypter] ✅ AUTH SUCCESS — resolved game "${internalGameId}" for emp_id=${empId}.`,
      );
      return internalGameId;
    } catch (error) {
      console.error('[TokenDecrypter] ❌ AUTH FAILED — unexpected error:', error);
      this.clearAuthentication();
      return null;
    }
  }

  /**
   * Open the game in a new browser tab to avoid CSP frame-ancestors issues.
   * Falls back to router navigation if the URL cannot be resolved.
   */
  secureNavigateToGame(gameId: string): void {
    const url = this.federationService.getGameUrl(gameId);
    if (url) {
      window.location.href = url;
    } else {
      this.router.navigate(['/play', gameId], {
        replaceUrl: true,
      });
    }
  }

  /**
   * Get the game ID from the current session
   */
  getCurrentGameId(): string | null {
    if (!this.payload?.game_id) return null;
    return this.federationService.resolveApiGameId(this.payload.game_id);
  }

  /**
   * Check if user has an active authenticated session
   */
  isAuthenticated(): boolean {
    return this.token !== null && this.store.hasValidState();
  }

  /**
   * Clear token + payload + store
   */
  clearAuthentication(): void {
    this.token = null;
    this.payload = null;
    this.store.clearState();
  }
}
