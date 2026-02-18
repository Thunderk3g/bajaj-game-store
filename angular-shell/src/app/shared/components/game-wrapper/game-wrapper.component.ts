import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FederationService } from '../../../core/services/federation.service';
import { GamificationStoreService } from '../../../core/services/gamification-store.service';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-game-wrapper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="game-wrapper">
      <div *ngIf="loading && !error" class="loading-overlay">
        <div class="loading-content">
          <div class="spinner-ring">
            <div class="ring"></div>
          </div>
          <p class="loading-text">Loading game<span class="dots"></span></p>
        </div>
      </div>

      <div *ngIf="error" class="error-overlay">
        <div class="error-content">
          <div class="error-icon">⚠️</div>
          <h2>Failed to Load Game</h2>
          <p class="error-msg">{{ errorMessage }}</p>
          <div class="error-actions">
            <button class="btn btn-primary" (click)="retry()">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 8a6 6 0 1 1 1.76 4.24"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <path
                  d="M2 12V8h4"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              Retry
            </button>
            <button class="btn btn-ghost" (click)="goBack()">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M10 12L6 8l4-4"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              Back to Lobby
            </button>
          </div>
        </div>
      </div>

      <iframe
        *ngIf="gameUrl && !error"
        [src]="gameUrl"
        class="game-iframe"
        (load)="onIframeLoad()"
        frameborder="0"
        allow="autoplay; fullscreen"
        allowfullscreen
        [class.visible]="!loading"
      ></iframe>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100vh;
        margin: 0;
        padding: 0;
        overflow: hidden;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 100;
      }

      .game-wrapper {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        overflow: hidden;
        position: relative;
        background: #000;
      }

      .game-iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: none;
        margin: 0;
        padding: 0;
        display: block;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .game-iframe.visible {
        opacity: 1;
      }

      .loading-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #0a0a0f;
        z-index: 10;
      }

      .loading-content {
        text-align: center;
      }

      .spinner-ring {
        width: 56px;
        height: 56px;
        margin: 0 auto 20px;
        position: relative;
      }

      .ring {
        width: 100%;
        height: 100%;
        border: 3px solid rgba(255, 255, 255, 0.08);
        border-top-color: #667eea;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .loading-text {
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.95rem;
        font-weight: 500;
        letter-spacing: 0.02em;
      }

      .dots::after {
        content: '';
        animation: dots 1.5s steps(4) infinite;
      }

      @keyframes dots {
        0% {
          content: '';
        }
        25% {
          content: '.';
        }
        50% {
          content: '..';
        }
        75% {
          content: '...';
        }
      }

      .error-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #0a0a0f;
        z-index: 10;
        padding: 24px;
      }

      .error-content {
        text-align: center;
        max-width: 400px;
      }

      .error-icon {
        font-size: 48px;
        margin-bottom: 16px;
      }

      .error-content h2 {
        font-size: 1.5rem;
        font-weight: 700;
        color: #ffffff;
        margin-bottom: 8px;
      }

      .error-msg {
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.9rem;
        margin-bottom: 28px;
        line-height: 1.5;
      }

      .error-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
        flex-wrap: wrap;
      }

      .btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        border-radius: 100px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        border: none;
      }

      .btn-primary {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
      }

      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
      }

      .btn-ghost {
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .btn-ghost:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      @media (max-width: 768px) {
        .error-actions {
          flex-direction: column;
          align-items: stretch;
        }
        .btn {
          justify-content: center;
          padding: 14px 24px;
        }
      }
    `,
  ],
})
export class GameWrapperComponent implements OnInit, OnDestroy {
  gameUrl: SafeResourceUrl | null = null;
  private gameId: string = '';

  loading = true;
  error = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private federationService: FederationService,
    private store: GamificationStoreService,
    private sanitizer: DomSanitizer,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.gameId = this.route.snapshot.params['gameId'];
    this.loadGame();
  }

  private loadGame() {
    this.loading = true;
    this.error = false;

    // Priority 1: Store-driven URL (JWT flow)
    // FederationService.getGameUrl already handles this priority
    const url = this.federationService.getGameUrl(this.gameId);

    if (!url) {
      this.error = true;
      this.errorMessage = `Game "${this.gameId}" not found`;
      this.loading = false;
      return;
    }

    this.gameUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    console.log(`[GameWrapper] Loading game "${this.gameId}" from: ${url}`);
  }

  onIframeLoad() {
    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        this.ngZone.run(() => {
          this.loading = false;
          this.cdr.detectChanges();
          console.log(`[GameWrapper] Game "${this.gameId}" loaded`);
        });
      });
    });
  }

  retry() {
    this.loadGame();
  }

  goBack() {
    this.store.clearState();
    this.router.navigate(['/']);
  }

  ngOnDestroy() {
    console.log(`[GameWrapper] Game "${this.gameId}" unloaded`);
  }
}
