import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FederationService,
  GameManifestEntry,
} from '../../core/services/federation.service';
import { SecurityService } from '../../core/services/security.service';
import { GamificationStoreService } from '../../core/services/gamification-store.service';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Token interceptor: auto-dispatching spinner -->
    <div class="lobby" *ngIf="dispatching">
      <div class="bg-glow bg-glow-1"></div>
      <div class="bg-glow bg-glow-2"></div>
      <div class="dispatch-overlay">
        <div class="dispatch-content">
          <div class="spinner-ring"><div class="ring"></div></div>
          <p class="dispatch-text">Authenticating<span class="dots"></span></p>
          <p class="dispatch-error" *ngIf="dispatchError">
            {{ dispatchError }}
          </p>
        </div>
      </div>
    </div>

    <!-- Normal lobby view -->
    <div class="lobby" *ngIf="!dispatching">
      <div class="bg-glow bg-glow-1"></div>
      <div class="bg-glow bg-glow-2"></div>
      <div class="bg-glow bg-glow-3"></div>

      <div class="lobby-content">
        <header class="lobby-header">
          <div class="logo-badge">🎮</div>
          <h1>Game <span class="gradient-text">Arcade</span></h1>
          <p class="subtitle">Choose a game and start playing</p>
        </header>

        <div class="games-grid">
          <div
            *ngFor="let game of games; let i = index"
            class="game-card"
            [class.popular]="game.popular"
            [style.animation-delay]="i * 80 + 'ms'"
            (click)="playGame(game.gameId)"
          >
            <div class="card-shine"></div>
            <div class="popular-tag" *ngIf="game.popular">
              <span>⭐</span> Popular
            </div>
            <div class="game-icon-wrap">
              <div class="game-icon">{{ getGameEmoji(game.gameId) }}</div>
            </div>
            <h3>{{ game.displayName }}</h3>
            <p class="game-type">{{ game.type | titlecase }} Game</p>
            <button class="play-btn">
              <span>Play Now</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div *ngIf="games.length === 0" class="empty-state">
          <div class="empty-icon">🕹️</div>
          <h3>No games available</h3>
          <p>Check back soon for new games!</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .lobby {
        min-height: 100vh;
        position: relative;
        overflow: hidden;
        background: #0a0a0f;
        padding: 0;
        margin: 0;
      }

      /* ── Dispatching overlay ── */
      .dispatch-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
      }
      .dispatch-content {
        text-align: center;
      }
      .spinner-ring {
        width: 56px;
        height: 56px;
        margin: 0 auto 20px;
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
      .dispatch-text {
        color: rgba(255, 255, 255, 0.6);
        font-size: 1rem;
        font-weight: 500;
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
      .dispatch-error {
        color: #e74c3c;
        margin-top: 12px;
        font-weight: 600;
        font-size: 0.9rem;
      }

      /* ── Animated bg blobs ── */
      .bg-glow {
        position: fixed;
        border-radius: 50%;
        filter: blur(120px);
        opacity: 0.35;
        pointer-events: none;
        z-index: 0;
        animation: float 20s ease-in-out infinite;
      }
      .bg-glow-1 {
        width: 500px;
        height: 500px;
        background: #667eea;
        top: -100px;
        left: -100px;
      }
      .bg-glow-2 {
        width: 400px;
        height: 400px;
        background: #764ba2;
        bottom: -50px;
        right: -50px;
        animation-delay: -7s;
      }
      .bg-glow-3 {
        width: 300px;
        height: 300px;
        background: #f093fb;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        animation-delay: -14s;
      }
      @keyframes float {
        0%,
        100% {
          transform: translate(0, 0) scale(1);
        }
        33% {
          transform: translate(30px, -40px) scale(1.05);
        }
        66% {
          transform: translate(-20px, 30px) scale(0.95);
        }
      }

      /* ── Content ── */
      .lobby-content {
        position: relative;
        z-index: 1;
        padding: 60px 24px 40px;
        max-width: 1200px;
        margin: 0 auto;
      }

      /* ── Header ── */
      .lobby-header {
        text-align: center;
        margin-bottom: 48px;
      }
      .logo-badge {
        width: 72px;
        height: 72px;
        background: rgba(102, 126, 234, 0.15);
        border: 1px solid rgba(102, 126, 234, 0.25);
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 36px;
        margin: 0 auto 20px;
        backdrop-filter: blur(10px);
        animation: pulse-glow 3s ease-in-out infinite;
      }
      @keyframes pulse-glow {
        0%,
        100% {
          box-shadow: 0 0 20px rgba(102, 126, 234, 0.15);
        }
        50% {
          box-shadow: 0 0 40px rgba(102, 126, 234, 0.3);
        }
      }
      .lobby-header h1 {
        font-size: 2.75rem;
        font-weight: 800;
        letter-spacing: -0.03em;
        color: #ffffff;
        margin-bottom: 8px;
      }
      .gradient-text {
        background: linear-gradient(135deg, #667eea, #764ba2, #f093fb);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .subtitle {
        color: rgba(255, 255, 255, 0.5);
        font-size: 1.1rem;
        font-weight: 400;
      }

      /* ── Cards Grid ── */
      .games-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 24px;
      }

      /* ── Game Card ── */
      .game-card {
        position: relative;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 24px;
        padding: 32px 24px;
        text-align: center;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        overflow: hidden;
        animation: card-in 0.5s ease-out both;
      }
      @keyframes card-in {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .card-shine {
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.03),
          transparent
        );
        transition: left 0.6s ease;
        pointer-events: none;
      }
      .game-card:hover .card-shine {
        left: 100%;
      }
      .game-card:hover {
        transform: translateY(-8px);
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(102, 126, 234, 0.3);
        box-shadow:
          0 20px 60px -15px rgba(102, 126, 234, 0.25),
          0 0 0 1px rgba(102, 126, 234, 0.1);
      }
      .game-card:active {
        transform: translateY(-4px) scale(0.98);
      }
      .game-card.popular {
        border-color: rgba(255, 215, 0, 0.2);
      }
      .game-card.popular:hover {
        border-color: rgba(255, 215, 0, 0.4);
        box-shadow:
          0 20px 60px -15px rgba(255, 215, 0, 0.2),
          0 0 0 1px rgba(255, 215, 0, 0.15);
      }
      .popular-tag {
        position: absolute;
        top: 16px;
        right: 16px;
        background: linear-gradient(135deg, #ffd700, #ffaa00);
        color: #1a1a1a;
        padding: 4px 12px;
        border-radius: 100px;
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .game-icon-wrap {
        width: 80px;
        height: 80px;
        margin: 0 auto 20px;
        border-radius: 24px;
        background: linear-gradient(
          135deg,
          rgba(102, 126, 234, 0.15),
          rgba(118, 75, 162, 0.15)
        );
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.3s ease;
      }
      .game-card:hover .game-icon-wrap {
        transform: scale(1.1) rotate(-3deg);
      }
      .game-icon {
        font-size: 40px;
      }
      .game-card h3 {
        font-size: 1.25rem;
        font-weight: 700;
        color: #ffffff;
        margin-bottom: 4px;
        letter-spacing: -0.01em;
      }
      .game-type {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.35);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-weight: 500;
        margin-bottom: 20px;
      }
      .play-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border: none;
        padding: 10px 24px;
        border-radius: 100px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      .play-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 8px 25px -5px rgba(102, 126, 234, 0.5);
      }

      /* ── Empty State ── */
      .empty-state {
        text-align: center;
        padding: 80px 24px;
      }
      .empty-icon {
        font-size: 64px;
        margin-bottom: 16px;
        animation: bounce 2s ease-in-out infinite;
      }
      @keyframes bounce {
        0%,
        100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-10px);
        }
      }
      .empty-state h3 {
        font-size: 1.5rem;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 8px;
      }
      .empty-state p {
        color: rgba(255, 255, 255, 0.4);
      }

      /* ── Mobile ── */
      @media (max-width: 768px) {
        .lobby-content {
          padding: 40px 16px 32px;
        }
        .lobby-header {
          margin-bottom: 32px;
        }
        .logo-badge {
          width: 60px;
          height: 60px;
          font-size: 28px;
          border-radius: 16px;
        }
        .lobby-header h1 {
          font-size: 2rem;
        }
        .subtitle {
          font-size: 0.95rem;
        }
        .games-grid {
          grid-template-columns: 1fr;
          gap: 16px;
        }
        .game-card {
          padding: 24px 20px;
          border-radius: 20px;
        }
        .game-card:hover {
          transform: translateY(-4px);
        }
        .game-icon-wrap {
          width: 64px;
          height: 64px;
          border-radius: 18px;
        }
        .game-icon {
          font-size: 32px;
        }
        .bg-glow-1 {
          width: 300px;
          height: 300px;
        }
        .bg-glow-2 {
          width: 250px;
          height: 250px;
        }
        .bg-glow-3 {
          width: 200px;
          height: 200px;
        }
      }
      @media (max-width: 380px) {
        .lobby-content {
          padding: 32px 12px 24px;
        }
        .lobby-header h1 {
          font-size: 1.75rem;
        }
        .game-card {
          padding: 20px 16px;
        }
      }
      @media (min-width: 900px) {
        .games-grid {
          grid-template-columns: repeat(3, 1fr);
        }
      }
    `,
  ],
})
export class LobbyComponent implements OnInit {
  games: (GameManifestEntry & { gameId: string })[] = [];
  dispatching = false;
  dispatchError: string | null = null;

  private gameEmojis: Record<string, string> = {
    'scramble-words': '🔤',
    'life-goals': '🎯',
    'quiz-game': '🧠',
    'retirement-readiness-journey': '🚀',
    'life-shield-bomber': '🛡️',
    'tile-flipping-game': '🧩',
  };


  constructor(
    private federationService: FederationService,
    private securityService: SecurityService,
    private store: GamificationStoreService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    // ── Step 1: Check for JWT in query params ──
    this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      const routeGameId = this.route.snapshot.params['gameId'];

      if (token) {
        this.handleTokenDispatch(token, routeGameId);
        return;
      }

      // ── Step 2: No token — show normal lobby ──
      this.loadGames();
    });
  }

  /**
   * Token flow:
   * Decrypt → validate → push to store → navigate to /play/:gameId
   * URL is scrubbed from browser history (replaceUrl: true)
   *
   * @param token     Encrypted AES string from query parameter
   * @param routeGameId  Optional API game ID from the URL path (e.g., GAME_001)
   */
  private async handleTokenDispatch(token: string, routeGameId?: string) {
    this.dispatching = true;
    this.dispatchError = null;

    console.log('[Lobby] Token detected, starting dispatch flow');

    // Small timeout to let the spinner render
    setTimeout(async () => {
      const gameId = await this.securityService.authenticateWithToken(token);

      if (!gameId) {
        this.dispatchError = 'Invalid or expired token. Redirecting...';
        console.error('[Lobby] Token authentication failed');

        // Redirect to lobby clean view after 2.5s
        setTimeout(() => {
          this.dispatching = false;
          this.dispatchError = null;
          this.router.navigate(['/'], { replaceUrl: true });
          this.loadGames();
        }, 2500);
        return;
      }

      // Resolve the game ID: use JWT gameId, but if the route had an API ID,
      // resolve it through the manifest mapping
      const resolvedGameId = routeGameId
        ? this.federationService.resolveApiGameId(routeGameId)
        : this.federationService.resolveApiGameId(gameId);

      console.log(`[Lobby] Token valid, dispatching to game: ${resolvedGameId}`);
      this.securityService.secureNavigateToGame(resolvedGameId);
    }, 300);
  }

  loadGames() {
    const allGames = this.federationService.getAllGames();
    this.games = allGames.map((game: any) => ({
      ...game,
      gameId: game.gameId,
    }));
  }

  getGameEmoji(gameId: string): string {
    return this.gameEmojis[gameId] || '🎮';
  }

  playGame(gameId: string) {
    // ── Create a Guest session so the AuthGuard allows access ──
    const manifest = this.federationService.getGameManifest(gameId);
    if (manifest) {
      this.store.setState(
        { id: 'GUEST_USER', name: 'Guest', region: 'Local' },
        {
          id: gameId,
          desc: manifest.displayName,
          url: this.federationService.getGameUrl(gameId) || '',
          thumbnail: '',
        },
        'GUEST_SESSION',
      );
    }

    this.router.navigate(['/play', gameId]);
  }
}
