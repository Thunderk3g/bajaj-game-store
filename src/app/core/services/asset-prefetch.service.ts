import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { FederationService } from './federation.service';
import { AssetLoadingLogger } from './asset-loading.logger';

@Injectable({
  providedIn: 'root',
})
export class AssetPrefetchService {
  constructor(
    private swUpdate: SwUpdate,
    private federationService: FederationService,
    private assetLogger: AssetLoadingLogger,
  ) {}

  /**
   * Prefetch assets for a specific game
   * @param gameId Game identifier
   */
  async prefetchGameAssets(gameId: string): Promise<void> {
    const manifest = this.federationService.getGameManifest(gameId);
    if (!manifest || !manifest.assets || manifest.assets.length === 0) {
      console.log(`[AssetPrefetch] ℹ️  No assets to prefetch for ${gameId}`);
      return;
    }

    console.log(`[AssetPrefetch] 📦 Prefetching ${manifest.assets.length} assets for game: ${gameId}`);

    // Use Cache API directly if Service Worker is not available
    if (!this.swUpdate.isEnabled) {
      console.log(`[AssetPrefetch] Service Worker disabled, using Cache API for ${gameId}`);
      await this.prefetchWithCacheAPI(manifest.assets, gameId);
      return;
    }

    // If Service Worker is available, let it handle caching
    console.log(`[AssetPrefetch] Service Worker enabled, using Cache API for ${gameId}`);
    await this.prefetchWithCacheAPI(manifest.assets, gameId);
  }

  /**
   * Prefetch popular games' assets in the background
   */
  async prefetchPopularGames(): Promise<void> {
    const popularGames = this.federationService.getPopularGames();
    console.log(`[AssetPrefetch] 🎮 Starting prefetch for popular games: ${popularGames.join(', ')}`);

    const results = {
      successful: [] as string[],
      failed: [] as { gameId: string; error: string }[],
    };

    for (const gameId of popularGames) {
      try {
        console.log(`[AssetPrefetch] ⏳ Processing game: ${gameId}`);
        await this.prefetchGameAssets(gameId);
        results.successful.push(gameId);
        console.log(`[AssetPrefetch] ✅ Successfully prefetched assets for ${gameId}`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        results.failed.push({ gameId, error: errorMsg });
        console.error(`[AssetPrefetch] ❌ Failed to prefetch assets for ${gameId}: ${errorMsg}`);
      }
    }

    console.log('[AssetPrefetch] 📊 Prefetch Summary:');
    console.log(`  ✅ Successful: ${results.successful.length} - [${results.successful.join(', ')}]`);
    console.log(`  ❌ Failed: ${results.failed.length}`);
    if (results.failed.length > 0) {
      results.failed.forEach(({ gameId, error }) => {
        console.log(`    • ${gameId}: ${error}`);
      });
    }
  }

  /**
   * Use Cache API to prefetch assets
   */
  private async prefetchWithCacheAPI(assetUrls: string[], gameId: string): Promise<void> {
    if (!('caches' in window)) {
      console.warn(`[AssetPrefetch] ⚠️  Cache API not available for ${gameId}`);
      return;
    }

    try {
      const cache = await caches.open('game-assets-v1');
      console.log(`[AssetPrefetch] 🔄 Cache opened for ${gameId}. Processing ${assetUrls.length} URLs...`);

      const results = {
        cached: [] as string[],
        failed: [] as { url: string; error: string }[],
      };

      await Promise.all(
        assetUrls.map((url) =>
          cache
            .add(url)
            .then(() => {
              results.cached.push(url);
              console.log(`[AssetPrefetch] ✅ Cached: ${url}`);
            })
            .catch((err) => {
              const errorMsg = err instanceof Error ? err.message : String(err);
              results.failed.push({ url, error: errorMsg });
              console.warn(`[AssetPrefetch] ⚠️  Failed to cache ${url}: ${errorMsg}`);
            }),
        ),
      );

      console.log(`[AssetPrefetch] 📊 Cache results for ${gameId}:`);
      console.log(`  ✅ Cached: ${results.cached.length}/${assetUrls.length}`);
      if (results.failed.length > 0) {
        console.log(`  ❌ Failed: ${results.failed.length}`);
        results.failed.forEach(({ url, error }) => {
          console.log(`    • ${url}: ${error}`);
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[AssetPrefetch] ❌ Failed to prefetch assets for ${gameId}: ${errorMsg}`);
      console.error('[AssetPrefetch] Current asset status:');
      const failedAssets = this.assetLogger.getFailedAssets();
      failedAssets.forEach(asset => {
        console.error(`  • ${asset.assetUrl}: ${asset.errorDetails}`);
      });
    }
  }
}
