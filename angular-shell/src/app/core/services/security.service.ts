import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import {
  GamificationStoreService,
} from './gamification-store.service';

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
      const salesPerson = this.payload['sales person'];
      const gameDetails = this.payload.gamedetails;

      if (!salesPerson?.id) {
        console.error('[SecurityService] Missing "sales person.id" in decrypted payload');
        this.clearAuthentication();
        return null;
      }

      if (!gameDetails?.id) {
        console.error('[SecurityService] Missing "gamedetails.id" in decrypted payload');
        this.clearAuthentication();
        return null;
      }

      // ── Push to centralized store ──
      this.store.setState(salesPerson, gameDetails, token);

      return gameDetails.id;
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
    return this.payload?.gamedetails?.id ?? null;
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
