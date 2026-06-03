import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FederationService,
  GameManifestEntry,
} from '../../core/services/federation.service';
import { SecurityService } from '../../core/services/security.service';
import { GamificationStoreService } from '../../core/services/gamification-store.service';

type LobbyGame = GameManifestEntry & { gameId: string };

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Atmospheric background: aurora gradients + drifting blobs + particles -->
    <div class="aurora" aria-hidden="true">
      <div class="aurora-base"></div>
      <div class="ar-blob ar-blob1"></div>
      <div class="ar-blob ar-blob2"></div>
      <div class="ar-blob ar-blob3"></div>
      <div class="aurora-noise"></div>
    </div>
    <div class="particles" aria-hidden="true">
      <span
        *ngFor="let p of particles"
        class="particle"
        [style.left.%]="p.left"
        [style.top.%]="p.top"
        [style.width.px]="p.size"
        [style.height.px]="p.size"
        [style.opacity]="p.op"
        [style.animation-duration.s]="p.dur"
        [style.animation-delay.s]="p.delay"
      ></span>
    </div>

    <!-- Token interceptor: auto-dispatching spinner -->
    <div class="stage" *ngIf="dispatching">
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
    <div class="stage" *ngIf="!dispatching">
      <!-- ── Slim arcade nav ── -->
      <div class="nav-wrap">
        <nav class="nav">
          <div class="brand">
            <div class="brand-text">
              <div class="brand-name">Bajaj Life</div>
              <div class="brand-sub">ARCADE</div>
            </div>
          </div>

          <div class="nav-links">
            <span class="nav-link active" (click)="scrollToLibrary()">Arcade</span>
            <span class="nav-link" (click)="scrollToLibrary()">Categories</span>
            <span class="nav-link" (click)="scrollToLibrary()">How to play</span>
          </div>

          <div class="nav-profile">
            <div class="avatar">G</div>
            <div class="nav-name">
              <div class="nav-name-top">Guest</div>
              <div class="nav-name-bot">Player</div>
            </div>
          </div>
        </nav>
      </div>

      <div class="lobby-content">
        <!-- ── Hero ── -->
        <section class="hero">
          <div class="float-orb float-orb1">
            <span class="orb orb-orange">
              <svg width="22" height="22" viewBox="0 0 24 24"><path d="M13 2 4 13h6l-1 9 9-12h-6l1-8z" fill="#fff"/></svg>
            </span>
          </div>
          <div class="float-orb float-orb2">
            <span class="orb orb-blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="#fff"/></svg>
            </span>
          </div>
          <div class="float-orb float-orb3">
            <span class="orb orb-cyan">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.1 14c.2-1 .8-1.8 1.5-2.5A6 6 0 1 0 7.4 11.5c.7.7 1.3 1.5 1.5 2.5"/></svg>
            </span>
          </div>

          <div class="hero-copy">
            <div class="hero-badge">
              <span class="badge-dot"></span>
              <span>BAJAJ LIFE · GAME ARCADE</span>
            </div>
            <h1 class="hero-title">
              Play. Learn.<br />
              <span class="hero-accent">Plan smarter.</span>
            </h1>
            <p class="hero-sub">
              Sharpen your money skills with quick, interactive games built
              around real financial decisions — from your first goal to a
              confident retirement.
            </p>
            <div class="hero-cta">
              <button class="btn btn-primary btn-lg" (click)="scrollToLibrary()">
                Browse games
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
              </button>
            </div>
            <div class="hero-stats">
              <div class="stat">
                <div class="stat-val">{{ games.length }}</div>
                <div class="stat-label">Games</div>
              </div>
              <div class="stat">
                <div class="stat-val">{{ popularCount }}</div>
                <div class="stat-label">Popular</div>
              </div>
              <div class="stat">
                <div class="stat-val">100%</div>
                <div class="stat-label">Free to play</div>
              </div>
            </div>
          </div>

          <!-- Featured spotlight -->
          <div class="hero-feature" *ngIf="featured" (click)="playGame(featured.gameId)">
            <div
              class="feature-stage"
              [class.no-img]="!hasThumbnail(featured.gameId)"
              [style.background]="!hasThumbnail(featured.gameId) ? fallbackGradient(featured.gameId) : null"
            >
              <img
                *ngIf="hasThumbnail(featured.gameId)"
                class="feature-img"
                [src]="getThumbnail(featured.gameId)"
                [alt]="featured.displayName"
                loading="eager"
                fetchpriority="high"
                decoding="async"
              />
              <div class="feature-stage-overlay"></div>
              <span class="chip chip-feat feature-chip">★ FEATURED</span>
            </div>
            <div class="feature-body">
              <h3 class="feature-title">{{ featured.displayName }}</h3>
              <p class="feature-desc">
                Jump straight into one of our most-played games and start learning by doing.
              </p>
              <div class="feature-meta">
                <span class="chip chip-glass">{{ featured.type | titlecase }}</span>
                <span class="chip chip-glass" *ngIf="featured.popular">Popular</span>
              </div>
              <button class="btn btn-primary feature-btn">
                Play now
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
              </button>
            </div>
          </div>
        </section>

        <!-- ── Game library ── -->
        <section id="library" class="library">
          <div class="section-head">
            <div>
              <div class="kicker">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF8A2B"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/></svg>
                EXPLORE THE LIBRARY
              </div>
              <h2 class="section-title">Game Library</h2>
            </div>
            <div class="library-tools">
              <div class="search">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7C879F" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>
                <input
                  type="text"
                  placeholder="Search games"
                  [value]="search"
                  (input)="onSearch($event)"
                />
              </div>
              <div class="filters">
                <span
                  *ngFor="let f of filters"
                  class="filter-pill"
                  [class.active]="filter === f"
                  (click)="setFilter(f)"
                  >{{ f }}</span
                >
              </div>
            </div>
          </div>

          <div class="games-grid">
            <div
              *ngFor="let game of visibleGames; let i = index"
              class="tile"
              [style.animation-delay]="(i % 9) * 60 + 'ms'"
              (click)="playGame(game.gameId)"
            >
              <div
                class="tile-thumb"
                [class.no-img]="!hasThumbnail(game.gameId)"
                [style.background]="!hasThumbnail(game.gameId) ? fallbackGradient(game.gameId) : null"
              >
                <img
                  *ngIf="hasThumbnail(game.gameId)"
                  class="tile-img"
                  [src]="getThumbnail(game.gameId)"
                  [alt]="game.displayName"
                  loading="eager"
                  decoding="async"
                />
                <span class="tile-fallback-mark" *ngIf="!hasThumbnail(game.gameId)">
                  {{ initial(game.displayName) }}
                </span>
                <div class="tile-thumb-overlay"></div>
                <span class="chip chip-hot tile-badge" *ngIf="game.popular">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFC487"><path d="M12 2c.8 3 3.2 4.6 4.4 6.2C18 10.2 19 12 19 14a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3 .2 1.1 1 2 2.2 2.2A2.5 2.5 0 0 0 11 11c0-1.4-.6-2.2-1.2-3.2C8.5 5.6 9.4 3.7 12 2z"/></svg>
                  POPULAR
                </span>
              </div>
              <div class="tile-body">
                <h3 class="tile-title">{{ game.displayName }}</h3>
                <p class="tile-type">{{ game.type | titlecase }} Game</p>
                <div class="tile-foot">
                  <button class="btn btn-primary btn-sm">
                    Play
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="visibleGames.length === 0" class="empty-state">
            <div class="empty-icon">🕹️</div>
            <h3>No games found</h3>
            <p>Try a different search or filter.</p>
          </div>
        </section>

        <!-- ── Footer ── -->
        <footer class="footer">
          <div class="footer-inner">
            <div class="footer-brand">
              <span>© 2026 Bajaj Life Insurance Co. Ltd. · The Game Arcade is for learning &amp; engagement only and is not financial advice.</span>
            </div>
            <div class="footer-links">
              <span>Privacy</span>
              <span>Terms</span>
              <span (click)="scrollToLibrary()">How to play</span>
              <span>Support</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        --bg0: #05070e;
        --card: #0e1729;
        --card-hi: #152038;
        --card-border: rgba(255, 255, 255, 0.08);
        --card-border-hi: rgba(255, 255, 255, 0.16);
        --orange: #ff8a2b;
        --orange-deep: #f2700f;
        --brand-blue: #0047ab;
        --brand-blue-deep: #003d8f;
        --blue: #3d7bff;
        --cyan: #28c4e8;
        --ink: #f4f6ff;
        --body: #b6bfd6;
        --muted: #7c879f;
        --faint: #586079;
        --font: 'Inter', 'Segoe UI', system-ui, sans-serif;
        --display: 'Space Grotesk', 'Inter', system-ui, sans-serif;

        display: block;
        min-height: 100vh;
        background: var(--bg0);
        color: var(--ink);
        font-family: var(--font);
        -webkit-font-smoothing: antialiased;
      }

      /* ── Aurora background ── */
      .aurora {
        position: fixed;
        inset: 0;
        z-index: 0;
        overflow: hidden;
        background: var(--bg0);
      }
      .aurora-base {
        position: absolute;
        inset: 0;
        background:
          radial-gradient(1200px 700px at 18% -8%, rgba(46, 99, 224, 0.34), transparent 60%),
          radial-gradient(1100px 680px at 92% 4%, rgba(255, 138, 43, 0.18), transparent 58%),
          radial-gradient(1000px 720px at 60% 100%, rgba(40, 196, 232, 0.16), transparent 60%),
          linear-gradient(180deg, #06080f 0%, #070b16 40%, #05070e 100%);
      }
      .ar-blob {
        position: absolute;
        border-radius: 50%;
        filter: blur(70px);
        will-change: transform;
        animation: drift 22s ease-in-out infinite;
      }
      .ar-blob1 {
        left: -8%;
        top: -6%;
        width: 560px;
        height: 560px;
        background: radial-gradient(circle, rgba(61, 116, 240, 0.5), transparent 68%);
      }
      .ar-blob2 {
        right: -6%;
        top: 8%;
        width: 520px;
        height: 520px;
        background: radial-gradient(circle, rgba(255, 138, 43, 0.34), transparent 68%);
        animation-duration: 28s;
        animation-delay: -6s;
      }
      .ar-blob3 {
        left: 34%;
        bottom: -14%;
        width: 620px;
        height: 620px;
        background: radial-gradient(circle, rgba(40, 196, 232, 0.3), transparent 70%);
        animation-duration: 34s;
        animation-delay: -12s;
      }
      @keyframes drift {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(40px, 30px) scale(1.08); }
        66% { transform: translate(-30px, 20px) scale(0.96); }
      }
      .aurora-noise {
        position: absolute;
        inset: 0;
        opacity: 0.5;
        background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
      }
      .particles {
        position: fixed;
        inset: 0;
        z-index: 1;
        pointer-events: none;
      }
      .particle {
        position: absolute;
        border-radius: 50%;
        background: #fff;
        box-shadow: 0 0 6px rgba(255, 255, 255, 0.6);
        will-change: transform, opacity;
        animation: floatUp linear infinite;
      }
      @keyframes floatUp {
        0% { transform: translateY(0) translateX(0); }
        50% { transform: translateY(-40px) translateX(12px); }
        100% { transform: translateY(0) translateX(0); }
      }

      .stage {
        position: relative;
        z-index: 2;
        min-height: 100vh;
      }

      /* ── Dispatch overlay ── */
      .dispatch-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
      }
      .dispatch-content { text-align: center; }
      .spinner-ring { width: 56px; height: 56px; margin: 0 auto 20px; }
      .ring {
        width: 100%;
        height: 100%;
        border: 3px solid rgba(255, 255, 255, 0.08);
        border-top-color: var(--blue);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      .dispatch-text { color: var(--body); font-size: 1rem; font-weight: 500; }
      .dots::after { content: ''; animation: dots 1.5s steps(4) infinite; }
      @keyframes dots {
        0% { content: ''; }
        25% { content: '.'; }
        50% { content: '..'; }
        75% { content: '...'; }
      }
      .dispatch-error { color: #ff6b6b; margin-top: 12px; font-weight: 600; font-size: 0.9rem; }

      /* ── Nav ── */
      .nav-wrap {
        position: sticky;
        top: 0;
        z-index: 50;
        padding: 18px 24px 0;
      }
      .nav {
        max-width: 1240px;
        margin: 0 auto;
        background: var(--card);
        border: 1px solid var(--card-border);
        border-radius: 18px;
        box-shadow: 0 18px 40px -26px rgba(0, 0, 0, 0.65);
        padding: 11px 16px 11px 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
      }
      .brand { display: flex; align-items: center; gap: 12px; }
      .brand-name { font-size: 17px; font-weight: 800; color: var(--ink); letter-spacing: -0.01em; line-height: 1; }
      .brand-sub { font-size: 9px; font-weight: 700; color: var(--orange); letter-spacing: 0.22em; margin-top: 4px; }
      .nav-links {
        display: flex;
        gap: 4px;
        background: rgba(0, 0, 0, 0.2);
        padding: 5px;
        border-radius: 13px;
        border: 1px solid var(--card-border);
      }
      .nav-link {
        font-size: 13.5px;
        font-weight: 600;
        padding: 8px 15px;
        border-radius: 9px;
        cursor: pointer;
        color: var(--muted);
        border: 1px solid transparent;
        transition: color 0.15s, background 0.15s;
      }
      .nav-link:hover { color: var(--ink); }
      .nav-link.active {
        color: var(--ink);
        background: rgba(255, 255, 255, 0.09);
        border-color: var(--card-border);
      }
      .nav-profile { display: flex; align-items: center; gap: 10px; }
      .avatar {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: linear-gradient(135deg, #5c9bff, #2e5be0);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 14px;
        color: #fff;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 0 0 2px var(--bg0), 0 0 0 4px rgba(61, 116, 240, 0.6);
      }
      .nav-name-top { font-size: 13px; font-weight: 700; color: var(--ink); line-height: 1.1; }
      .nav-name-bot { font-size: 11px; color: var(--muted); }

      /* ── Layout ── */
      .lobby-content {
        position: relative;
        z-index: 1;
        padding: 0 24px 60px;
      }

      /* ── Hero ── */
      .hero {
        position: relative;
        max-width: 1240px;
        margin: 0 auto;
        padding: 44px 0 8px;
        display: grid;
        grid-template-columns: 1.02fr 0.98fr;
        gap: 48px;
        align-items: center;
      }
      .float-orb { position: absolute; z-index: 1; animation: floaty 7s ease-in-out infinite; }
      .float-orb1 { left: 47%; top: 24px; }
      .float-orb2 { right: 26px; top: -10px; animation-duration: 9s; animation-delay: -2s; }
      .float-orb3 { right: 42%; bottom: -16px; animation-duration: 8s; animation-delay: -4s; }
      @keyframes floaty {
        0%, 100% { transform: translateY(0) rotate(-3deg); }
        50% { transform: translateY(-16px) rotate(3deg); }
      }
      .orb {
        width: 50px;
        height: 50px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.45), inset 0 -6px 12px rgba(0, 0, 0, 0.28);
      }
      .orb-orange { background: linear-gradient(145deg, #ffb057, #f2700f); }
      .orb-blue { width: 44px; height: 44px; background: linear-gradient(145deg, #5c9bff, #2e5be0); }
      .orb-cyan { width: 38px; height: 38px; background: linear-gradient(145deg, #48dcf0, #1488c8); }

      .hero-copy { position: relative; z-index: 2; }
      .hero-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 7px 14px;
        border-radius: 999px;
        background: rgba(61, 116, 240, 0.16);
        border: 1px solid rgba(61, 116, 240, 0.36);
        margin-bottom: 22px;
        font-size: 12.5px;
        font-weight: 700;
        letter-spacing: 0.1em;
        color: #a9c6ff;
      }
      .badge-dot {
        width: 7px;
        height: 7px;
        border-radius: 4px;
        background: var(--blue);
        box-shadow: 0 0 10px var(--blue);
      }
      .hero-title {
        font-family: var(--display);
        font-size: 58px;
        line-height: 1.02;
        font-weight: 700;
        color: var(--ink);
        margin: 0;
        letter-spacing: -0.03em;
      }
      .hero-accent {
        background: linear-gradient(110deg, var(--orange), #ffd27a 45%, var(--blue));
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        color: transparent;
      }
      .hero-sub {
        font-size: 18px;
        color: var(--body);
        line-height: 1.55;
        margin: 20px 0 30px;
        max-width: 482px;
      }
      .hero-cta { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
      .hero-stats { display: flex; align-items: center; gap: 26px; margin-top: 30px; }
      .stat { display: flex; flex-direction: column; }
      .stat-val { font-family: var(--display); font-size: 20px; font-weight: 700; color: var(--ink); line-height: 1.1; }
      .stat-label { font-size: 11.5px; color: var(--muted); margin-top: 2px; }

      /* ── Buttons ── */
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
        font-family: var(--font);
        font-weight: 700;
        border-radius: 13px;
        cursor: pointer;
        border: 1px solid transparent;
        white-space: nowrap;
        transition: transform 0.18s cubic-bezier(0.2, 0.7, 0.3, 1), filter 0.18s, box-shadow 0.18s;
      }
      .btn-primary {
        background: linear-gradient(135deg, var(--blue), var(--brand-blue-deep));
        color: #fff;
        box-shadow: 0 10px 26px -8px rgba(0, 71, 171, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.28);
      }
      .btn:hover { transform: translateY(-2px); filter: brightness(1.08); }
      .btn:active { transform: translateY(0) scale(0.98); }
      .btn-lg { font-size: 16px; padding: 15px 30px; }
      .btn-sm { font-size: 13.5px; padding: 9px 16px; }
      .btn:not(.btn-lg):not(.btn-sm) { font-size: 14.5px; padding: 12px 22px; }

      /* ── Chips ── */
      .chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 11.5px;
        font-weight: 700;
        letter-spacing: 0.02em;
        padding: 5px 10px;
        border-radius: 999px;
      }
      .chip-glass { background: rgba(255, 255, 255, 0.06); color: var(--body); border: 1px solid var(--card-border); }
      .chip-hot { background: rgba(255, 138, 43, 0.16); color: #ffc487; border: 1px solid rgba(255, 138, 43, 0.32); }
      .chip-feat { background: rgba(61, 116, 240, 0.2); color: #a9c6ff; border: 1px solid rgba(61, 116, 240, 0.4); }

      /* ── Featured spotlight (portrait poster + copy) ── */
      .hero-feature {
        position: relative;
        z-index: 2;
        background: var(--card);
        border: 1px solid var(--card-border);
        border-radius: 18px;
        box-shadow: 0 18px 40px -26px rgba(0, 0, 0, 0.65);
        overflow: hidden;
        cursor: pointer;
        display: flex;
        transition: transform 0.24s cubic-bezier(0.2, 0.7, 0.3, 1), border-color 0.24s, box-shadow 0.24s;
      }
      .hero-feature:hover {
        transform: translateY(-5px);
        border-color: var(--card-border-hi);
        box-shadow: 0 36px 70px -28px rgba(0, 0, 0, 0.85), 0 0 50px -10px rgba(61, 116, 240, 0.4);
      }
      .feature-stage {
        position: relative;
        width: 210px;
        flex-shrink: 0;
        aspect-ratio: 9 / 16;
        border-right: 1px solid var(--card-border);
        overflow: hidden;
        background: #0b1322;
      }
      .feature-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.4s cubic-bezier(0.2, 0.7, 0.3, 1);
      }
      .hero-feature:hover .feature-img { transform: scale(1.05); }
      .feature-stage.no-img { display: flex; align-items: center; justify-content: center; }
      .feature-stage-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(5, 7, 14, 0) 55%, rgba(5, 7, 14, 0.5));
        pointer-events: none;
      }
      .feature-chip { position: absolute; top: 14px; left: 14px; }
      .feature-body { padding: 24px; display: flex; flex-direction: column; justify-content: center; flex: 1; min-width: 0; }
      .feature-title { font-family: var(--display); font-size: 22px; font-weight: 700; color: var(--ink); margin: 0 0 8px; letter-spacing: -0.01em; }
      .feature-desc { font-size: 13.5px; color: var(--body); line-height: 1.5; margin: 0 0 16px; }
      .feature-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; }
      .feature-btn { width: 100%; }

      /* ── Section head ── */
      .library { max-width: 1240px; margin: 60px auto 0; }
      .section-head {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 24px;
        margin-bottom: 22px;
        flex-wrap: wrap;
      }
      .kicker {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.14em;
        color: var(--orange);
        margin-bottom: 10px;
      }
      .section-title { font-family: var(--display); font-size: 30px; font-weight: 700; color: var(--ink); margin: 0; letter-spacing: -0.02em; }
      .library-tools { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
      .search {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 9px 14px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--card-border);
      }
      .search input {
        background: transparent;
        border: none;
        outline: none;
        color: var(--ink);
        font-family: var(--font);
        font-size: 13.5px;
        width: 140px;
      }
      .search input::placeholder { color: var(--muted); }
      .filters { display: flex; gap: 8px; flex-wrap: wrap; }
      .filter-pill {
        font-size: 13px;
        font-weight: 700;
        padding: 9px 16px;
        border-radius: 999px;
        cursor: pointer;
        color: var(--muted);
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--card-border);
        transition: transform 0.15s, background 0.2s, color 0.2s;
      }
      .filter-pill:hover { transform: translateY(-1px); }
      .filter-pill.active {
        color: #fff;
        background: linear-gradient(135deg, var(--blue), var(--brand-blue));
        border-color: transparent;
        box-shadow: 0 8px 20px -8px rgba(0, 71, 171, 0.8);
      }

      /* ── Grid + tiles ── */
      .games-grid {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 18px;
      }
      .tile {
        position: relative;
        background: var(--card);
        border: 1px solid var(--card-border);
        border-radius: 22px;
        overflow: hidden;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        box-shadow: 0 18px 40px -26px rgba(0, 0, 0, 0.65);
        transition: transform 0.24s cubic-bezier(0.2, 0.7, 0.3, 1), box-shadow 0.24s, border-color 0.24s;
        animation: tile-in 0.5s ease-out both;
      }
      @keyframes tile-in {
        from { opacity: 0; transform: translateY(22px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .tile:hover {
        transform: translateY(-7px);
        border-color: var(--card-border-hi);
        box-shadow: 0 36px 70px -28px rgba(0, 0, 0, 0.85), 0 0 50px -12px rgba(61, 116, 240, 0.45);
      }
      .tile-thumb {
        position: relative;
        aspect-ratio: 9 / 16;
        overflow: hidden;
        background: #0b1322;
      }
      .tile-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.4s cubic-bezier(0.2, 0.7, 0.3, 1);
      }
      .tile:hover .tile-img { transform: scale(1.06); }
      .tile-thumb.no-img { display: flex; align-items: center; justify-content: center; }
      .tile-fallback-mark {
        font-family: var(--display);
        font-size: 46px;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.92);
        text-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
      }
      .tile-thumb-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(5, 7, 14, 0) 45%, rgba(5, 7, 14, 0.55));
        pointer-events: none;
      }
      .tile-badge { position: absolute; top: 10px; right: 10px; transform: scale(0.92); transform-origin: top right; }
      .tile-body { padding: 13px 14px 14px; display: flex; flex-direction: column; flex: 1; }
      .tile-title { font-family: var(--display); font-size: 14.5px; font-weight: 700; color: var(--ink); margin: 0 0 3px; letter-spacing: -0.01em; line-height: 1.2; }
      .tile-type { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.09em; font-weight: 600; margin: 0 0 12px; }
      .tile-foot { margin-top: auto; display: flex; align-items: center; justify-content: flex-end; }

      /* ── Empty ── */
      .empty-state { text-align: center; padding: 80px 24px; }
      .empty-icon { font-size: 64px; margin-bottom: 16px; }
      .empty-state h3 { font-size: 1.5rem; font-weight: 700; color: rgba(255, 255, 255, 0.7); margin-bottom: 8px; }
      .empty-state p { color: var(--muted); }

      /* ── Footer ── */
      .footer { max-width: 1240px; margin: 56px auto 0; }
      .footer-inner {
        border-top: 1px solid var(--card-border);
        padding-top: 26px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 16px;
      }
      .footer-brand { display: flex; align-items: center; gap: 11px; max-width: 720px; }
      .footer-brand span { font-size: 13px; color: var(--muted); }
      .footer-links { display: flex; gap: 22px; }
      .footer-links span { font-size: 13px; font-weight: 600; color: var(--body); cursor: pointer; }
      .footer-links span:hover { color: var(--ink); }

      /* ── Responsive ── */
      @media (max-width: 1240px) { .games-grid { grid-template-columns: repeat(5, 1fr); } }
      @media (max-width: 1040px) {
        .hero { grid-template-columns: 1fr; gap: 32px; }
        .float-orb { display: none; }
        .games-grid { grid-template-columns: repeat(4, 1fr); }
        .hero-title { font-size: 46px; }
      }
      @media (max-width: 760px) { .games-grid { grid-template-columns: repeat(3, 1fr); } }
      @media (max-width: 720px) {
        .nav-links, .nav-name { display: none; }
      }

      /* ── Mobile view (≤560px): compact banner, 3-up grid, decluttered ── */
      @media (max-width: 560px) {
        .nav-wrap { padding: 12px 14px 0; }
        .lobby-content { padding: 0 14px 48px; }

        /* Compact + cleaner banner */
        .hero { padding: 20px 0 4px; gap: 0; }
        .hero-badge { margin-bottom: 14px; padding: 6px 12px; font-size: 11.5px; }
        .hero-title { font-size: 30px; }
        .hero-sub { font-size: 14.5px; line-height: 1.5; margin: 12px 0 18px; max-width: none; }
        .hero-cta { gap: 10px; }
        .btn-lg { font-size: 15px; padding: 13px 22px; }

        /* Strip decorative clutter on mobile */
        .hero-stats { display: none; }
        .hero-feature { display: none; }      /* remove GAME HIGHLIGHT */
        .kicker svg { display: none; }
        .kicker { margin-bottom: 8px; }
        .btn svg { display: none; }            /* arrows in Browse/Play buttons */
        /* NOTE: .search svg (magnifier) intentionally kept — functional, not decoration */

        /* Section head */
        .section-head { align-items: flex-start; gap: 14px; margin-bottom: 16px; }
        .section-title { font-size: 24px; }
        .library { margin-top: 36px; }
        .library-tools { width: 100%; }
        .search { flex: 1; }
        .search input { width: 100%; }

        /* 3-up dense game grid */
        .games-grid { grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .tile { border-radius: 14px; }
        .tile-body { padding: 8px 9px 10px; }
        .tile-title {
          font-size: 12px;
          line-height: 1.25;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .tile-type { display: none; }          /* type sub-label */
        .tile-badge { display: none; }          /* POPULAR badge */
        .tile-foot { display: none; }           /* per-tile Play button — tile stays tappable */
      }
      @media (prefers-reduced-motion: reduce) {
        .ar-blob, .particle, .float-orb { animation: none; }
        .tile { animation: none; }
      }
    `,
  ],
})
export class LobbyComponent implements OnInit {
  games: LobbyGame[] = [];
  visibleGames: LobbyGame[] = [];
  featured: LobbyGame | null = null;
  dispatching = false;
  dispatchError: string | null = null;

  filters = ['All', 'Popular'];
  filter = 'All';
  search = '';

  // Decorative floating particles for the aurora layer.
  particles = Array.from({ length: 26 }).map(() => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 1.5 + Math.random() * 3,
    dur: 9 + Math.random() * 14,
    delay: -Math.random() * 20,
    op: 0.18 + Math.random() * 0.5,
  }));

  // Best representative thumbnail per game (relative to <base href>).
  // Verified to exist under src/assets/games. Games omitted here fall back
  // to a generated gradient tile with the game's initial.
  private thumbnails: Record<string, string> = {
    'scramble-words': 'assets/games/scramble-words/assets/NewSartScreen-TzgqQz12.png',
    'life-goals': 'assets/games/life-goals/assets/images/life_thumbnail.png',
    'quiz-game': 'assets/games/quiz-game/assets/Quiz-bg.png',
    'life-milestone-race': 'assets/games/life-milestone-race/assets/Life-Milestone-Race-BcAYZSic.png',
    'retirement-readiness-journey': 'assets/games/retirement-readiness-journey/assets/Intro.png',
    'secure-saga': 'assets/games/secure-saga/assets/secure-thumbnail-BSwajrC7.png',
    'retirement-sudoku': 'assets/games/retirement-sudoku/assets/Cover-Image-xp2SmHEX.png',
    'financial-tetris': 'assets/games/financial-tetris/assets/welcome_bg.png',
    'life-shield-bomber': 'assets/games/life-shield-bomber/assets/Shield-Man-BGibnM4H.png',
    'tile-flipping-game': 'assets/games/tile-flipping-game/assets/tile-bg.png',
    'Snake-Life': 'assets/games/Snake-Life/Snake-Life TN.png',
    'life-flight': 'assets/games/life-flight/assets/Life Leap Start Page-BOvKOyng.png',
    'life-snakes-ladders': 'assets/games/life-snakes-ladders/assets/s&l intro-bg.png',
    'one-life': 'assets/games/one-life/TN_Expect_The_Unexpected-thumbnail.png',
    'life-sorted': 'assets/games/life-sorted/ls-bg.png',
    'health-shield': 'assets/games/health-shield/assets/intro-mole-rush.png',
    'cover-word-rescue': 'assets/games/cover-word-rescue/assets/cover-word-hero-BkRnV1qG.webp',
    'debt-defender': 'assets/games/debt-defender/assets/intro_screen-DHD2Ab_n.png',
    'shield-marble-vita': 'assets/games/shield-marble-vita/assets/shield-marble-hero-zSiC_W6s.webp',
    'ulip-picture-puzzle': 'assets/games/ulip-picture-puzzle/ulip-puzzle-art.png',
    'ulip-wealth-whacker': 'assets/games/ulip-wealth-whacker/assets/intro-mole-rush.png',
  };

  // Gradient presets for games without a thumbnail (Bajaj blue / cyan family).
  private fallbackGrads = [
    'linear-gradient(145deg, #5c8bff, #1e3fc8)',
    'linear-gradient(145deg, #48dcf0, #1488c8)',
    'linear-gradient(145deg, #36dcc0, #138c9e)',
    'linear-gradient(145deg, #6f8bff, #2e3fc8)',
  ];

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
    // Featured spotlight: prefer a popular game that has a real thumbnail.
    this.featured =
      this.games.find((g) => g.popular && this.hasThumbnail(g.gameId)) ||
      this.games.find((g) => this.hasThumbnail(g.gameId)) ||
      this.games[0] ||
      null;
    this.applyFilters();
  }

  get popularCount(): number {
    return this.games.filter((g) => g.popular).length;
  }

  setFilter(f: string) {
    this.filter = f;
    this.applyFilters();
  }

  onSearch(event: Event) {
    this.search = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  private applyFilters() {
    const q = this.search.trim().toLowerCase();
    this.visibleGames = this.games.filter((g) => {
      const matchesFilter = this.filter === 'All' || (this.filter === 'Popular' && g.popular);
      const matchesSearch = !q || g.displayName.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }

  hasThumbnail(gameId: string): boolean {
    return !!this.thumbnails[gameId];
  }

  getThumbnail(gameId: string): string {
    const raw = this.thumbnails[gameId];
    // Encode spaces (and other unsafe chars) so img src resolves correctly.
    return raw ? encodeURI(raw) : '';
  }

  fallbackGradient(gameId: string): string {
    let hash = 0;
    for (let i = 0; i < gameId.length; i++) {
      hash = (hash * 31 + gameId.charCodeAt(i)) >>> 0;
    }
    return this.fallbackGrads[hash % this.fallbackGrads.length];
  }

  initial(name: string): string {
    return (name || '?').trim().charAt(0).toUpperCase();
  }

  scrollToLibrary() {
    const el = document.getElementById('library');
    if (el) {
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 20, behavior: 'smooth' });
    }
  }

  playGame(gameId: string) {
    // ── Set up a Guest session so getConstructedGameUrl includes user params ──
    const manifest = this.federationService.getGameManifest(gameId);
    if (manifest) {
      this.store.setState(
        { id: 'GUEST_USER', name: 'Guest', region: 'Local', mobile: '', zone: '' },
        {
          id: gameId,
          desc: manifest.displayName,
          url: this.federationService.getGameUrl(gameId) || '',
          thumbnail: '',
        },
        'GUEST_SESSION',
      );
    }

    // ── Open game in a new tab to avoid CSP frame-ancestors issues ──
    const url = this.federationService.getGameUrl(gameId);
    if (url) {
      window.location.href = url;
    } else {
      console.error(`[Lobby] No URL found for game: ${gameId}`);
    }
  }
}
