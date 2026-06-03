import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-session-expired',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="expired-page">
      <div class="bg-glow bg-glow-1"></div>
      <div class="bg-glow bg-glow-2"></div>

      <div class="expired-content">
        <div class="icon-container">
          <div class="lock-icon">🔒</div>
        </div>

        <h1>Session Expired</h1>
        <p class="subtitle">
          Your game session has expired or you don't have access to this page.
        </p>

        <div class="info-card">
          <p>
            This usually happens when you try to access a game directly without
            a valid token. Please use the link provided to you (e.g., from
            WhatsApp) to start a new session.
          </p>
        </div>

        <div class="actions">
          <button class="btn btn-primary" (click)="goHome()">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M2.25 6.75L9 1.5l6.75 5.25V15a1.5 1.5 0 0 1-1.5 1.5H3.75a1.5 1.5 0 0 1-1.5-1.5V6.75z"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M6.75 16.5V9h4.5v7.5"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            Go to Lobby
          </button>
        </div>

        <p class="help-text">Need help? Contact your sales representative.</p>
      </div>
    </div>
  `,
  styles: [
    `
      .expired-page {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: #0a0a0f;
        color: white;
        text-align: center;
        padding: 24px;
        position: relative;
        overflow: hidden;
      }

      .bg-glow {
        position: fixed;
        border-radius: 50%;
        filter: blur(120px);
        opacity: 0.25;
        pointer-events: none;
      }
      .bg-glow-1 {
        width: 400px;
        height: 400px;
        background: #e74c3c;
        top: -100px;
        right: -100px;
      }
      .bg-glow-2 {
        width: 350px;
        height: 350px;
        background: #764ba2;
        bottom: -80px;
        left: -80px;
      }

      .expired-content {
        position: relative;
        z-index: 1;
        max-width: 420px;
      }

      .icon-container {
        width: 88px;
        height: 88px;
        margin: 0 auto 24px;
        background: rgba(231, 76, 60, 0.12);
        border: 1px solid rgba(231, 76, 60, 0.2);
        border-radius: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: shake 0.6s ease-in-out;
      }

      @keyframes shake {
        0%,
        100% {
          transform: translateX(0);
        }
        20% {
          transform: translateX(-8px);
        }
        40% {
          transform: translateX(8px);
        }
        60% {
          transform: translateX(-4px);
        }
        80% {
          transform: translateX(4px);
        }
      }

      .lock-icon {
        font-size: 40px;
      }

      h1 {
        font-size: 2rem;
        font-weight: 800;
        letter-spacing: -0.03em;
        margin-bottom: 8px;
      }

      .subtitle {
        color: rgba(255, 255, 255, 0.5);
        font-size: 1rem;
        margin-bottom: 28px;
        line-height: 1.5;
      }

      .info-card {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 28px;
      }

      .info-card p {
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.9rem;
        line-height: 1.6;
        margin: 0;
      }

      .actions {
        margin-bottom: 24px;
      }

      .btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 28px;
        border-radius: 100px;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        border: none;
      }

      .btn-primary {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
      }

      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
      }

      .help-text {
        color: rgba(255, 255, 255, 0.3);
        font-size: 0.8rem;
      }

      @media (max-width: 768px) {
        .expired-content {
          padding: 0 8px;
        }
        h1 {
          font-size: 1.6rem;
        }
        .icon-container {
          width: 72px;
          height: 72px;
          border-radius: 22px;
        }
        .lock-icon {
          font-size: 32px;
        }
      }
    `,
  ],
})
export class SessionExpiredComponent {
  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/']);
  }
}
