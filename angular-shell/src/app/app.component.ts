import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AssetLoadingLogger } from './core/services/asset-loading.logger';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
  styles: [],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'angular-shell';
  private reportInterval: any;

  constructor(private assetLogger: AssetLoadingLogger) { console.log('UAT Deployed : 20-02-2026 16:56'); }

  ngOnInit(): void {

    console.log('🎮 UAT Deployed Gamification');
    console.log('[AppComponent] Application initialized');

    // Log initial asset status after a short delay to allow assets to load
    setTimeout(() => {
      console.log('[AppComponent] Initial asset summary:');
      this.assetLogger.printReport();
    }, 2000);

    // Set up periodic reporting (every 10 seconds while app is running)
    this.reportInterval = setInterval(() => {
      const summary = this.assetLogger.getSummary();
      const failed = this.assetLogger.getFailedAssets();

      if (failed.length > 0) {
        console.warn('[AppComponent] Failed assets detected:', failed);
      } else {
        console.log(
          '[AppComponent] ✅ All assets loaded successfully. Total: ' +
          summary.total,
        );
      }
    }, 10000);

    // Log when new assets are added/loaded
    window.addEventListener('load', () => {
      console.log('[AppComponent] Window load event fired');
      setTimeout(() => {
        this.assetLogger.printReport();
      }, 500);
    });
  }

  ngOnDestroy(): void {
    if (this.reportInterval) {
      clearInterval(this.reportInterval);
    }
    console.log('[AppComponent] Component destroyed. Final asset report:');
    this.assetLogger.printReport();
  }
}
