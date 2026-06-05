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
    try {
      this.manifest = await firstValueFrom(
        this.http.get<GameManifest>(environment.manifestUrl),
      );
    } catch (error) {
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
    const entry = this.getGameManifest(gameId);

    // ── Priority 1: Manifest flow (bundled games) ──
    if (entry) {
      const basePath = entry.remoteEntry.substring(
        0,
        entry.remoteEntry.lastIndexOf('/') + 1,
      );

      const storeState = this.store.getSnapshot();
      const params = new URLSearchParams();
      // Use the canonical API gameId (e.g. GAME_024) from the manifest entry,
      // not the route slug (e.g. whole-life-galaga). The iframe writes this
      // value into sessionStorage.gamification_gameId, which is read by
      // incrementPlayCount and other backend calls.
      const apiGameId = entry.gameId || gameId;

      if (storeState && storeState.salesPerson) {
        params.set('userId', storeState.salesPerson.id || 'GUEST_USER');
        params.set('gameId', apiGameId);
        params.set('empName', storeState.salesPerson.name || '');
        params.set('empMobile', storeState.salesPerson.mobile || '');
        params.set('location', storeState.salesPerson.region || '');
        params.set('zone', storeState.salesPerson.zone || '');
        params.set('token', storeState.rawToken || '');
      } else {
        const salesPersonId = this.store.getSalesPersonId() || 'GUEST_USER';
        params.set('salesPersonId', salesPersonId);
        params.set('gameId', apiGameId);
      }

      return `${this.baseHref}${basePath}?${params.toString()}`;
    }

    // ── Priority 2: JWT-dispatched flow (remote/unknown games) ──
    const storeUrl = this.store.getConstructedGameUrl();
    if (storeUrl) {
      return storeUrl;
    }

    return null;
  }

  /**
   * Get all available games from the manifest
   */
  getAllGames(): GameManifestEntry[] {
    if (!this.manifest) {
      return [];
    }
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
    if (!this.manifest) {
      return [];
    }
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
          return key;
        }
      }
    }

    return apiGameId;
  }
}
