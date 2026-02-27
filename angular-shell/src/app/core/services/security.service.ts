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
   * Decrypt AES-256 ECB payload using CryptoJS.
   */
  private decryptAES(encryptedB64: string, keyB64: string): any {
    try {
      const key = CryptoJS.enc.Base64.parse(keyB64);
      const decrypted = CryptoJS.AES.decrypt(encryptedB64, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      });

      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
      if (!decryptedText) {
        console.error('[SecurityService] Decryption resulted in empty string');
        return null;
      }

      return JSON.parse(decryptedText);
    } catch (e) {
      console.error('[SecurityService] Decryption failed', e);
      return null;
    }
  }

  /**
   * Authenticate and extract gameId
   * @param token  Encrypted AES string from query parameter
   * @returns      gameId if valid, null if invalid/expired
   */
  async authenticateWithToken(token: string): Promise<string | null> {
    try {
      this.token = token;

      // Real AES decryption
      this.payload = this.decryptAES(token, AES_KEY_B64);

      if (!this.payload) {
        console.error('[SecurityService] Payload decryption failed or empty');
        this.clearAuthentication();
        return null;
      }

      console.log('[SecurityService] Payload decrypted:', this.payload);

      // ── Extract required claims ──
      // Based on real payload: { game_id, emp_id, emp_name, emp_mobile, location, zone }
      const empId = this.payload.emp_id;
      const gameIdApi = this.payload.game_id;

      if (!empId) {
        console.error('[SecurityService] Missing "emp_id" in decrypted payload');
        this.clearAuthentication();
        return null;
      }

      if (!gameIdApi) {
        console.error('[SecurityService] Missing "game_id" in decrypted payload');
        this.clearAuthentication();
        return null;
      }

      // Resolve the internal game ID (e.g., GAME_001 -> life-goals)
      const internalGameId = this.federationService.resolveApiGameId(gameIdApi);
      const manifest = this.federationService.getGameManifest(internalGameId);

      if (!manifest) {
        console.error(`[SecurityService] No manifest found for resolved game ID: ${internalGameId}`);
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
      this.store.setState(salesPerson, gameDetails, token);

      return internalGameId;
    } catch (error) {
      console.error('[SecurityService] Authentication failed:', error);
      this.clearAuthentication();
      return null;
    }
  }

  /**
   * Navigate to /play/:gameId and scrub the token from browser history/URL
   */
  secureNavigateToGame(gameId: string): void {
    this.router.navigate(['/play', gameId], {
      replaceUrl: true, // removes token URL from browser history
    });
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
