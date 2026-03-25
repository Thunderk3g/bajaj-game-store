import { Inject, Injectable } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GamificationStoreService } from './gamification-store.service';
import { environment } from '../../../environments/environment';

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
    @Inject(APP_BASE_HREF) private baseHref: string,
  ) { }

  /**
   * Load the federation manifest from assets.
   * Called during app initialization via APP_INITIALIZER.
   */
  async loadManifest(): Promise<void> {
    const startTime = performance.now();
    try {
      console.log(
        `[FederationService] 📥 Loading manifest from ${environment.manifestUrl}...`,
      );
      this.manifest = await firstValueFrom(
        this.http.get<GameManifest>(environment.manifestUrl),
      );
      const duration = performance.now() - startTime;

      const gameCount = Object.keys(this.manifest).length;
      const popularGames = Object.entries(this.manifest)
        .filter(([_, entry]) => entry.popular)
        .map(([id, _]) => id);

      console.log(
        `[FederationService] ✅ Manifest loaded successfully in ${duration.toFixed(2)}ms`,
      );
      console.log(`[FederationService] 📊 Manifest Summary:`);
      console.log(`  • Total Games: ${gameCount}`);
      console.log(
        `  • Popular Games: ${popularGames.length} - [${popularGames.join(', ')}]`,
      );

      // Log details for each game
      console.log(`[FederationService] 📋 Game Details:`);
      Object.entries(this.manifest).forEach(([id, entry]) => {
        console.log(`  • ${id}:`);
        console.log(`    - Display Name: ${entry.displayName}`);
        console.log(`    - Type: ${entry.type}`);
        console.log(`    - Remote Entry: ${entry.remoteEntry}`);
        console.log(`    - Exposed Module: ${entry.exposedModule}`);
        console.log(`    - Assets: ${entry.assets?.length || 0}`);
        console.log(`    - Popular: ${entry.popular}`);
      });
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(
        `[FederationService] ❌ Failed to load manifest in ${duration.toFixed(2)}ms:`,
        error,
      );
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[FederationService] Error Details: ${errorMsg}`);
      throw error;
    }
  }

  /**
   * Get manifest entry for a specific game
   */
  getGameManifest(gameId: string): GameManifestEntry | null {
    const entry = this.manifest?.[gameId] || null;
    if (!entry) {
      console.warn(
        `[FederationService] ⚠️  No manifest entry found for game: ${gameId}`,
      );
    } else {
      console.log(
        `[FederationService] ✅ Retrieved manifest for game: ${gameId}`,
      );
    }
    return entry;
  }

  /**
   * Get the URL to load a game in the iframe.
   *
   * Priority:
   * 1. If GamificationStore has data (JWT flow) → {gameUrl}/{salesPersonId}/{gameId}
   * 2. Fallback to manifest-based URL (lobby flow) → /assets/games/{gameId}/index.html
   */
  getGameUrl(gameId: string): string | null {
    const entry = this.getGameManifest(gameId);

    // ── Priority 1: Manifest flow (bundled games) ──
    if (entry) {
      const basePath = entry.remoteEntry.substring(
        0,
        entry.remoteEntry.lastIndexOf('/') + 1,
      );

      const storeState = this.store.getSnapshot();
      const params = new URLSearchParams();

      if (storeState && storeState.salesPerson) {
        params.set('userId', storeState.salesPerson.id || 'GUEST_USER');
        params.set('gameId', gameId);
        params.set('empName', storeState.salesPerson.name || '');
        params.set('empMobile', storeState.salesPerson.mobile || '');
        params.set('location', storeState.salesPerson.region || '');
        params.set('zone', storeState.salesPerson.zone || '');
        params.set('token', storeState.rawToken || '');
      } else {
        const salesPersonId = this.store.getSalesPersonId() || 'GUEST_USER';
        params.set('salesPersonId', salesPersonId);
        params.set('gameId', gameId);
      }

      const manifestUrl = `${this.baseHref}${basePath}?${params.toString()}`;
      console.log(
        `[FederationService] 🔗 Using manifest URL for game "${gameId}": ${manifestUrl}`,
      );
      return manifestUrl;
    }

    // ── Priority 2: JWT-dispatched flow (remote/unknown games) ──
    const storeUrl = this.store.getConstructedGameUrl();
    if (storeUrl) {
      console.log(
        `[FederationService] 🔗 Using store URL for remote game "${gameId}": ${storeUrl}`,
      );
      return storeUrl;
    }

    console.error(
      `[FederationService] ❌ Cannot construct game URL - no manifest entry for ${gameId}`,
    );
    return null;
  }

  /**
   * Get all available games from the manifest
   */
  getAllGames(): GameManifestEntry[] {
    if (!this.manifest) {
      console.warn(
        '[FederationService] ⚠️  Manifest not loaded - cannot get games',
      );
      return [];
    }
    const games = Object.entries(this.manifest).map(
      ([id, entry]) =>
        ({
          ...entry,
          gameId: id,
        }) as GameManifestEntry,
    );
    console.log(
      `[FederationService] 📋 Retrieved ${games.length} total games from manifest`,
    );
    return games;
  }

  /**
   * Get popular games for prefetching
   */
  getPopularGames(): string[] {
    if (!this.manifest) {
      console.warn(
        '[FederationService] ⚠️  Manifest not loaded - cannot get popular games',
      );
      return [];
    }
    const popularGames = Object.entries(this.manifest)
      .filter(([_, entry]) => entry.popular)
      .map(([id, _]) => id);
    console.log(
      `[FederationService] ⭐ Found ${popularGames.length} popular games: [${popularGames.join(', ')}]`,
    );
    return popularGames;
  }

  /**
   * Resolve an API game ID (e.g., GAME_001) to the internal manifest key
   * (e.g., life-goals). Returns the input as-is if it already matches
   * a manifest key or if no mapping is found.
   */
  resolveApiGameId(apiGameId: string): string {
    // If it already matches a manifest key directly, return it
    if (this.manifest?.[apiGameId]) {
      console.log(
        `[FederationService] ✅ API ID "${apiGameId}" matches manifest key directly`,
      );
      return apiGameId;
    }

    // Look up by the gameId field in manifest entries
    if (this.manifest) {
      for (const [key, entry] of Object.entries(this.manifest)) {
        if (entry.gameId === apiGameId) {
          console.log(
            `[FederationService] ✅ Resolved API ID "${apiGameId}" → "${key}"`,
          );
          return key;
        }
      }
    }

    console.warn(
      `[FederationService] ⚠️  No mapping found for API ID "${apiGameId}", using as-is`,
    );
    return apiGameId;
  }
}
