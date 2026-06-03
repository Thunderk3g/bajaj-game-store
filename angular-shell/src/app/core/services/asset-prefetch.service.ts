import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { FederationService } from './federation.service';

@Injectable({
  providedIn: 'root',
})
export class AssetPrefetchService {
  constructor(
    private swUpdate: SwUpdate,
    private federationService: FederationService,
  ) {}

  /**
   * Prefetch assets for a specific game
   * @param gameId Game identifier
   */
  async prefetchGameAssets(gameId: string): Promise<void> {
    const manifest = this.federationService.getGameManifest(gameId);
    if (!manifest || !manifest.assets || manifest.assets.length === 0) {
      return;
    }

    // Use Cache API directly if Service Worker is not available
    if (!this.swUpdate.isEnabled) {
      await this.prefetchWithCacheAPI(manifest.assets);
      return;
    }

    // If Service Worker is available, let it handle caching
    await this.prefetchWithCacheAPI(manifest.assets);
  }

  /**
   * Prefetch popular games' assets in the background
   */
  async prefetchPopularGames(): Promise<void> {
    const popularGames = this.federationService.getPopularGames();

    for (const gameId of popularGames) {
      try {
        await this.prefetchGameAssets(gameId);
      } catch (error) {
        // fail silently
      }
    }
  }

  /**
   * Use Cache API to prefetch assets
   */
  private async prefetchWithCacheAPI(assetUrls: string[]): Promise<void> {
    if (!('caches' in window)) {
      return;
    }

    try {
      const cache = await caches.open('game-assets-v1');
      await Promise.all(
        assetUrls.map((url) =>
          cache
            .add(url)
            .catch((err) => {
              // fail silently
            }),
        ),
      );
    } catch (error) {
      // fail silently
    }
  }
}

