import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from './app.routes';
import { FederationService } from './core/services/federation.service';
import { AssetPrefetchService } from './core/services/asset-prefetch.service';
import { AssetLoadingLogger } from './core/services/asset-loading.logger';
import { environment } from '../environments/environment';

/**
 * Initialize federation manifest on app startup
 */
export function initializeApp(
  federationService: FederationService,
  assetPrefetchService: AssetPrefetchService,
  assetLogger: AssetLoadingLogger,
) {
  return async () => {
    const startTime = performance.now();
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║         🎮 INITIALIZING GAMIFICATION SHELL               ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('[AppInit] Starting application initialization...');
    console.log('[AppInit] Asset Logger initialized');

    try {
      console.log('[AppInit] Loading federation manifest...');
      const manifestStartTime = performance.now();

      // Load federation manifest first
      await federationService.loadManifest();

      const manifestDuration = performance.now() - manifestStartTime;
      console.log(`[AppInit] ✅ Federation manifest loaded in ${manifestDuration.toFixed(2)}ms`);

      // Prefetch popular games' assets in background
      console.log('[AppInit] Scheduling background asset prefetch...');
      setTimeout(() => {
        const prefetchStartTime = performance.now();
        console.log('[AppInit] Starting background prefetch of popular games...');

        assetPrefetchService
          .prefetchPopularGames()
          .then(() => {
            const prefetchDuration = performance.now() - prefetchStartTime;
            console.log(`[AppInit] ✅ Background prefetch completed in ${prefetchDuration.toFixed(2)}ms`);
          })
          .catch((err) => {
            console.warn('[AppInit] ⚠️  Background prefetch failed:', err);
            console.log('[AppInit] Failed assets during prefetch:');
            assetLogger.getFailedAssets().forEach(asset => {
              console.log(`  - ${asset.assetUrl}: ${asset.errorDetails}`);
            });
          });
      }, 2000); // Delay to not block initial app load

      const totalDuration = performance.now() - startTime;
      console.log('╔════════════════════════════════════════════════════════════╗');
      console.log('║         ✅ APP INITIALIZATION COMPLETE                     ║');
      console.log(`║         Total Duration: ${totalDuration.toFixed(2)}ms`.padEnd(61) + '║');
      console.log('╚════════════════════════════════════════════════════════════╝');
    } catch (error) {
      console.error('╔════════════════════════════════════════════════════════════╗');
      console.error('║         ❌ APP INITIALIZATION FAILED                       ║');
      console.error('╚════════════════════════════════════════════════════════════╝');
      console.error('[AppInit] Initialization error:', error);
      console.error('[AppInit] Failed assets:');
      assetLogger.getFailedAssets().forEach(asset => {
        console.error(`  - ${asset.assetUrl}: ${asset.errorDetails}`);
      });
      // Don't throw - let app continue even if manifest fails
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: false, // Enable this in production
      registrationStrategy: 'registerWhenStable:30000',
    }),
    {
      provide: APP_BASE_HREF,
      useValue: environment.envName === 'dev' ? '/' : '/gamification/',
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [FederationService, AssetPrefetchService, AssetLoadingLogger],
      multi: true,
    },
  ],
};
