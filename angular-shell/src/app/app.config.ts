import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from './app.routes';
import { FederationService } from './core/services/federation.service';
import { AssetPrefetchService } from './core/services/asset-prefetch.service';
import { environment } from '../environments/environment';

/**
 * Initialize federation manifest on app startup
 */
export function initializeApp(
  federationService: FederationService,
  assetPrefetchService: AssetPrefetchService,
) {
  return async () => {
    try {
      // Load federation manifest first
      await federationService.loadManifest();

      // Prefetch popular games' assets in background
      setTimeout(() => {
        assetPrefetchService
          .prefetchPopularGames()
          .catch((err) => {
            // handle error silently
          });
      }, 2000); // Delay to not block initial app load
    } catch (error) {
      // handle error silently
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
      useValue: undefined,
      deps: [FederationService, AssetPrefetchService],
      multi: true,
    },
  ],
};

