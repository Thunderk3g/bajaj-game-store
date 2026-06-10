import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GameLoaderComponent } from './shared/components/game-loader/game-loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, GameLoaderComponent],
  template: `
    <router-outlet></router-outlet>

    <div
      *ngIf="showSplash"
      class="splash-overlay"
      [class.fading]="splashFading"
    >
      <app-game-loader [durationMs]="3000"></app-game-loader>
    </div>
  `,
  styles: [
    `
      .splash-overlay {
        position: fixed;
        inset: 0;
        z-index: 1000;
        background: #02050f;
        transition: opacity 0.55s ease;
        opacity: 1;
      }

      .splash-overlay.fading {
        opacity: 0;
        pointer-events: none;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  title = 'angular-shell';

  /** Minimum splash duration before the store is revealed */
  private static readonly SPLASH_DURATION_MS = 3000;

  showSplash = true;
  splashFading = false;

  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      this.splashFading = true;
      setTimeout(() => {
        this.showSplash = false;
        this.splashFading = false;
      }, 600);
    }, AppComponent.SPLASH_DURATION_MS);

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

    console.log('🎮 UAT Deployed Gamification  -> 09th June 2026 , 13:16 PM');
    console.log('🎮 PROD Deployed Gamification  -> 05th June 2026 , 16:00 PM');
  }
}
