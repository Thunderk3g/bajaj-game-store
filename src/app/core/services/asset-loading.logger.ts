import { Injectable } from '@angular/core';

export interface AssetLoadLog {
  timestamp: Date;
  assetUrl: string;
  assetType: 'script' | 'stylesheet' | 'image' | 'font' | 'other';
  status: 'loading' | 'loaded' | 'failed' | 'error';
  duration?: number;
  errorDetails?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AssetLoadingLogger {
  private assetLogs: AssetLoadLog[] = [];
  private readonly MAX_LOGS = 500; // Keep only last 500 logs

  constructor() {
    this.monitorAssets();
  }

  /**
   * Monitor all asset loading events
   */
  private monitorAssets(): void {
    // Monitor script loading
    this.monitorScriptLoading();

    // Monitor stylesheet loading
    this.monitorStylesheetLoading();

    // Monitor image loading
    this.monitorImageLoading();

    // Monitor resource loading via Performance API
    this.monitorPerformanceResources();

    // Monitor errors
    this.monitorErrors();

    console.log('[AssetLoadingLogger] Asset monitoring initialized');
  }

  /**
   * Monitor script tag loading
   */
  private monitorScriptLoading(): void {
    const originalCreate = document.createElement;
    const self = this;

    document.createElement = function (tagName: string, ...args: any[]): any {
      const element = originalCreate.call(document, tagName, ...args);

      if (tagName.toLowerCase() === 'script') {
        const startTime = performance.now();

        const logScript = (status: 'loaded' | 'failed' | 'error', errorMsg?: string) => {
          const duration = performance.now() - startTime;
          const src = (element as HTMLScriptElement).src || 'inline';
          self.logAsset({
            timestamp: new Date(),
            assetUrl: src,
            assetType: 'script',
            status,
            duration,
            errorDetails: errorMsg,
          });
          console.log(
            `[AssetLoadingLogger] Script ${status}: ${src} (${duration.toFixed(2)}ms)`,
            errorMsg ? `- Error: ${errorMsg}` : '',
          );
        };

        element.addEventListener('load', () => logScript('loaded'));
        element.addEventListener('error', () => logScript('failed', 'Script load failed'));
      }

      return element;
    };
  }

  /**
   * Monitor stylesheet loading
   */
  private monitorStylesheetLoading(): void {
    const originalCreate = document.createElement;
    const self = this;

    document.createElement = function (tagName: string, ...args: any[]): any {
      const element = originalCreate.call(document, tagName, ...args);

      if (tagName.toLowerCase() === 'link') {
        const originalSetAttribute = element.setAttribute;
        element.setAttribute = function (name: string, value: string) {
          if (name === 'href' && (element as HTMLLinkElement).rel === 'stylesheet') {
            const startTime = performance.now();

            const logStylesheet = (status: 'loaded' | 'failed' | 'error', errorMsg?: string) => {
              const duration = performance.now() - startTime;
              self.logAsset({
                timestamp: new Date(),
                assetUrl: value,
                assetType: 'stylesheet',
                status,
                duration,
                errorDetails: errorMsg,
              });
              console.log(
                `[AssetLoadingLogger] Stylesheet ${status}: ${value} (${duration.toFixed(2)}ms)`,
                errorMsg ? `- Error: ${errorMsg}` : '',
              );
            };

            const onLoadHandler = () => logStylesheet('loaded');
            const onErrorHandler = () => logStylesheet('failed', 'Stylesheet load failed');

            element.addEventListener('load', onLoadHandler);
            element.addEventListener('error', onErrorHandler);
          }
          return originalSetAttribute.call(this, name, value);
        };
      }

      return element;
    };
  }

  /**
   * Monitor image loading
   */
  private monitorImageLoading(): void {
    const originalCreate = document.createElement;
    const self = this;

    document.createElement = function (tagName: string, ...args: any[]): any {
      const element = originalCreate.call(document, tagName, ...args);

      if (tagName.toLowerCase() === 'img') {
        const startTime = performance.now();

        const logImage = (status: 'loaded' | 'failed' | 'error', errorMsg?: string) => {
          const duration = performance.now() - startTime;
          const src = (element as HTMLImageElement).src || 'no-src';
          self.logAsset({
            timestamp: new Date(),
            assetUrl: src,
            assetType: 'image',
            status,
            duration,
            errorDetails: errorMsg,
          });
          console.log(
            `[AssetLoadingLogger] Image ${status}: ${src} (${duration.toFixed(2)}ms)`,
            errorMsg ? `- Error: ${errorMsg}` : '',
          );
        };

        element.addEventListener('load', () => logImage('loaded'));
        element.addEventListener('error', () => logImage('failed', 'Image load failed'));
      }

      return element;
    };
  }

  /**
   * Monitor resources via Performance API
   */
  private monitorPerformanceResources(): void {
    const self = this;

    // Check for PerformanceObserver support
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list: PerformanceObserverEntryList) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource') {
              const resourceEntry = entry as PerformanceResourceTiming;
              const assetType = self.getAssetTypeFromUrl(resourceEntry.name);
              const duration = resourceEntry.duration;

              // Check for potential CORS/Network issues
              // A resource timing entry with 0 transferSize and 0 decodedBodySize
              // BUT with a non-zero duration or responseEnd usually indicates a cross-origin
              // resource that is loading successfully but has restricted timing info.
              const isPotentiallyRestricted =
                resourceEntry.transferSize === 0 &&
                resourceEntry.decodedBodySize === 0 &&
                resourceEntry.responseEnd > 0;

              if (resourceEntry.transferSize === 0 && resourceEntry.decodedBodySize === 0 && !isPotentiallyRestricted) {
                self.logAsset({
                  timestamp: new Date(),
                  assetUrl: resourceEntry.name,
                  assetType,
                  status: 'failed',
                  duration,
                  errorDetails: 'No data transferred - possible CORS, 404, or network issue',
                });
                console.warn(
                  `[AssetLoadingLogger] Resource failure/warning: ${resourceEntry.name} - No data transferred`,
                );
              } else {
                // Asset is loaded (even if timing is restricted)
                self.logAsset({
                  timestamp: new Date(),
                  assetUrl: resourceEntry.name,
                  assetType,
                  status: 'loaded',
                  duration,
                });
              }
            }
          }
        });

        observer.observe({ entryTypes: ['resource'] });
        console.log('[AssetLoadingLogger] PerformanceObserver initialized');
      } catch (error) {
        console.warn('[AssetLoadingLogger] PerformanceObserver setup failed:', error);
      }
    }
  }

  /**
   * Monitor global errors
   */
  private monitorErrors(): void {
    const self = this;

    window.addEventListener('error', (event: ErrorEvent) => {
      if (event.filename && (
        event.filename.includes('.js') ||
        event.filename.includes('.css') ||
        event.filename.includes('.html') ||
        event.filename.includes('.woff') ||
        event.filename.includes('.woff2') ||
        event.filename.includes('.png') ||
        event.filename.includes('.jpg') ||
        event.filename.includes('.svg')
      )) {
        self.logAsset({
          timestamp: new Date(),
          assetUrl: event.filename,
          assetType: self.getAssetTypeFromUrl(event.filename),
          status: 'error',
          errorDetails: event.message,
        });
        console.error(
          `[AssetLoadingLogger] Asset error: ${event.filename} - ${event.message}`,
        );
      }
    });

    // Monitor unhandled promise rejections
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      if (event.reason && typeof event.reason === 'object') {
        const errorMsg = JSON.stringify(event.reason);
        if (errorMsg.includes('asset') || errorMsg.includes('load') || errorMsg.includes('404')) {
          console.error(
            '[AssetLoadingLogger] Unhandled rejection (possible asset issue):',
            event.reason,
          );
        }
      }
    });

    console.log('[AssetLoadingLogger] Error monitoring initialized');
  }

  /**
   * Log an asset
   */
  private logAsset(log: AssetLoadLog): void {
    // Only log once for the same asset URL to avoid duplicates between observers
    const existing = this.assetLogs.find(l => l.assetUrl === log.assetUrl && l.status === log.status);
    if (existing) return;

    this.assetLogs.push(log);

    // Keep only last MAX_LOGS entries
    if (this.assetLogs.length > this.MAX_LOGS) {
      this.assetLogs = this.assetLogs.slice(-this.MAX_LOGS);
    }
  }

  /**
   * Get asset type from URL
   */
  private getAssetTypeFromUrl(url: string): 'script' | 'stylesheet' | 'image' | 'font' | 'other' {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('.js')) return 'script';
    if (lowerUrl.includes('.css')) return 'stylesheet';
    if (lowerUrl.includes('.html')) return 'other';
    if (lowerUrl.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    if (lowerUrl.match(/\.(woff|woff2|ttf|otf|eot)$/)) return 'font';
    return 'other';
  }

  /**
   * Get all asset logs
   */
  public getLogs(): AssetLoadLog[] {
    return [...this.assetLogs];
  }

  /**
   * Get failed asset logs
   */
  public getFailedAssets(): AssetLoadLog[] {
    return this.assetLogs.filter((log) => log.status === 'failed' || log.status === 'error');
  }

  /**
   * Get asset loading summary
   */
  public getSummary(): {
    total: number;
    loaded: number;
    failed: number;
    totalDuration: number;
    byType: Record<string, { total: number; loaded: number; failed: number }>;
  } {
    const summary = {
      total: this.assetLogs.length,
      loaded: 0,
      failed: 0,
      totalDuration: 0,
      byType: {
        script: { total: 0, loaded: 0, failed: 0 },
        stylesheet: { total: 0, loaded: 0, failed: 0 },
        image: { total: 0, loaded: 0, failed: 0 },
        font: { total: 0, loaded: 0, failed: 0 },
        other: { total: 0, loaded: 0, failed: 0 },
      },
    };

    for (const log of this.assetLogs) {
      if (log.status === 'loaded') summary.loaded++;
      if (log.status === 'failed' || log.status === 'error') summary.failed++;
      if (log.duration) summary.totalDuration += log.duration;

      const typeStats = summary.byType[log.assetType];
      typeStats.total++;
      if (log.status === 'loaded') typeStats.loaded++;
      if (log.status === 'failed' || log.status === 'error') typeStats.failed++;
    }

    return summary;
  }

  /**
   * Print a detailed report to console
   */
  public printReport(): void {
    const summary = this.getSummary();
    const failed = this.getFailedAssets();

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║           ASSET LOADING REPORT                             ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    console.log('\n📊 SUMMARY:');
    console.log(`  Total Assets: ${summary.total}`);
    console.log(`  ✅ Loaded: ${summary.loaded}`);
    console.log(`  ❌ Failed: ${summary.failed}`);
    console.log(`  ⏱️  Total Duration: ${summary.totalDuration.toFixed(2)}ms`);

    console.log('\n📈 BY TYPE:');
    for (const [type, stats] of Object.entries(summary.byType)) {
      if (stats.total > 0) {
        const percentage = ((stats.loaded / stats.total) * 100).toFixed(1);
        console.log(
          `  ${type.padEnd(12)} : ${stats.loaded}/${stats.total} loaded (${percentage}%)${stats.failed > 0 ? ` ⚠️  ${stats.failed} failed` : ''
          }`,
        );
      }
    }

    if (failed.length > 0) {
      console.log(`\n❌ FAILED ASSETS (${failed.length}):`);
      for (const asset of failed) {
        console.log(`  • ${asset.assetUrl}`);
        if (asset.errorDetails) {
          console.log(`    └─ ${asset.errorDetails}`);
        }
        if (asset.duration) {
          console.log(`    └─ Duration: ${asset.duration.toFixed(2)}ms`);
        }
      }
    }

    console.log('\n📋 ALL LOGS:');
    console.table(this.assetLogs);
  }

  /**
   * Get logs for a specific game
   */
  public getLogsForGame(gameId: string): AssetLoadLog[] {
    return this.assetLogs.filter((log) => log.assetUrl.includes(gameId));
  }

  /**
   * Export logs as JSON (for debugging/analysis)
   */
  public exportLogs(): string {
    return JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        summary: this.getSummary(),
        logs: this.assetLogs,
      },
      null,
      2,
    );
  }
}
