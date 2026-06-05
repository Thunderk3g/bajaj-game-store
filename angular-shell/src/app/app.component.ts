import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
  styles: [],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'angular-shell';

  constructor() { }

  ngOnInit(): void {

    const madeByBox = 

    const madeByBox =

      '┌────────────────────────────────────────────────────────┐\n' +
      '│                        MADE BY                         │\n' +
      '├────────────────────────────────────────────────────────┤\n' +
      '│  - Diwakar Adhikari Chetri                             │\n' +
      '│  - Abhishek Gurjar                                     │\n' +
      '│  - Yashraj Lawate                                      │\n' +
      '│  - Utkarsh Das                                         │\n' +
      '│  - Tanish Jagtap                                       │\n' +
      '└────────────────────────────────────────────────────────┘';

    console.log(`%c${madeByBox}`, 'color: #00ffcc; font-family: monospace; font-weight: bold; background: #05070e;');

    console.log('🎮 UAT Deployed Gamification  -> 03rd June 2026 , 11:56 AM');
    console.log('🎮 PROD Deployed Gamification  -> 25th May 2026 , 17:00 PM');

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

    const madeByBox = 
      '┌────────────────────────────────────────────────────────┐\n' +
      '│                        MADE BY                         │\n' +
      '├────────────────────────────────────────────────────────┤\n' +
      '│  - Diwakar Adhikari Chetri                             │\n' +
      '│  - Abhishek Gurjar                                     │\n' +
      '│  - Yashraj Lawate                                      │\n' +
      '│  - Utkarsh Das                                         │\n' +
      '│  - Tanish Jagtap                                       │\n' +
      '└────────────────────────────────────────────────────────┘';
    console.log(`%c${madeByBox}`, 'color: #00ffcc; font-family: monospace; font-weight: bold; background: #05070e;');
    console.log(
      `%c${madeByBox}`,
      'font-family: monospace; font-weight: bold; background: linear-gradient(135deg, #ff007f, #7f00ff, #00f0ff, #ff8a00); color: #ffffff; padding: 4px; border-radius: 4px; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);'
    );

    const deploymentBox =
      '┌────────────────────────────────────────────────────────┐\n' +
      '│                   DEPLOYMENT STATUS                    │\n' +
      '├────────────────────────────────────────────────────────┤\n' +
      '│  UAT  -> 03rd June 2026 , 16:53 PM                     │\n' +
      '│  PROD -> 03rd June 2026 , 17:00 PM                     │\n' +
      '└────────────────────────────────────────────────────────┘';
    console.log(
      `%c${deploymentBox}`,
      'font-family: monospace; font-weight: bold; color: #ffffff; background: #000000; padding: 4px; border-radius: 4px;'
    );
  }

  ngOnDestroy(): void {
  }
}

