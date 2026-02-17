import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GamificationStoreService } from './gamification-store.service';

// ── Interfaces ──────────────────────────────────────────────────

export interface GameManifestEntry {
  remoteEntry: string;
  exposedModule: string;
  type: string;
  displayName: string;
  popular: boolean;
  assets: string[];
  gameId?: string;
}

export interface GameManifest {
  [gameId: string]: GameManifestEntry;
}

// ── Service ─────────────────────────────────────────────────────

@Injectable({
  providedIn: 'root',
})
export class FederationService {
  private manifest: GameManifest | null = null;

  constructor(
    private http: HttpClient,
    private store: GamificationStoreService,
  ) { }

  /**
   * Load the federation manifest from assets.
   * Called during app initialization via APP_INITIALIZER.
   */
  async loadManifest(): Promise<void> {
    try {
      this.manifest = await firstValueFrom(
        this.http.get<GameManifest>('assets/federation.manifest.json'),
      );
      console.log('[FederationService] Manifest loaded:', this.manifest);
    } catch (error) {
      console.error('[FederationService] Failed to load manifest:', error);
      throw error;
    }
  }

  /**
   * Get manifest entry for a specific game
   */
  getGameManifest(gameId: string): GameManifestEntry | null {
    return this.manifest?.[gameId] || null;
  }

  /**
   * Get the URL to load a game in the iframe.
   *
   * Priority:
   * 1. If GamificationStore has data (JWT flow) → {gameUrl}/{salesPersonId}/{gameId}
   * 2. Fallback to manifest-based URL (lobby flow) → /assets/games/{gameId}/index.html
   */
  getGameUrl(gameId: string): string | null {
    // ── JWT-dispatched flow ──
    // If the store has a constructed URL from JWT data, use that
    const storeUrl = this.store.getConstructedGameUrl();
    if (storeUrl) {
      console.log(
        `[FederationService] Using store URL for "${gameId}":`,
        storeUrl,
      );
      return storeUrl;
    }

    // ── Lobby / manifest fallback ──
    const entry = this.getGameManifest(gameId);
    if (!entry) return null;

    // Extract base path from remoteEntry
    // e.g., "/assets/games/scramble-words/index.js" → "/assets/games/scramble-words/"
    const basePath = entry.remoteEntry.substring(
      0,
      entry.remoteEntry.lastIndexOf('/') + 1,
    );
    const fallbackUrl = basePath + 'index.html';
    console.log(
      `[FederationService] Using manifest URL for "${gameId}":`,
      fallbackUrl,
    );
    return fallbackUrl;
  }

  /**
   * Get all available games from the manifest
   */
  getAllGames(): GameManifestEntry[] {
    if (!this.manifest) return [];
    return Object.entries(this.manifest).map(
      ([id, entry]) =>
        ({
          ...entry,
          gameId: id,
        }) as GameManifestEntry,
    );
  }

  /**
   * Get popular games for prefetching
   */
  getPopularGames(): string[] {
    if (!this.manifest) return [];
    return Object.entries(this.manifest)
      .filter(([_, entry]) => entry.popular)
      .map(([id, _]) => id);
  }

  /**
   * Resolve an API game ID (e.g., GAME_001) to the internal manifest key
   * (e.g., life-goals). Returns the input as-is if it already matches
   * a manifest key or if no mapping is found.
   */
  resolveApiGameId(apiGameId: string): string {
    // If it already matches a manifest key directly, return it
    if (this.manifest?.[apiGameId]) {
      return apiGameId;
    }

    // Look up by the gameId field in manifest entries
    if (this.manifest) {
      for (const [key, entry] of Object.entries(this.manifest)) {
        if (entry.gameId === apiGameId) {
          console.log(
            `[FederationService] Resolved API ID "${apiGameId}" → "${key}"`,
          );
          return key;
        }
      }
    }

    console.warn(
      `[FederationService] No mapping found for API ID "${apiGameId}", using as-is`,
    );
    return apiGameId;
  }
}

