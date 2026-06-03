import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-fallback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-page">
      <div class="error-content">
        <div class="error-icon">⚠️</div>
        <h1>Game Unavailable</h1>
        <p>
          We're sorry, but the game you're trying to access is currently
          unavailable.
        </p>
        <p class="error-details">
          This could be due to maintenance or a temporary issue.
        </p>
        <div class="actions">
          <button class="primary-btn" (click)="returnToLobby()">
            Return to Lobby
          </button>
          <button class="secondary-btn" (click)="refresh()">Try Again</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .error-page {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        text-align: center;
        padding: 20px;
      }

      .error-content {
        max-width: 500px;
      }

      .error-icon {
        font-size: 80px;
        margin-bottom: 20px;
        animation: pulse 2s ease-in-out infinite;
      }

      @keyframes pulse {
        0%,
        100% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.1);
          opacity: 0.8;
        }
      }

      h1 {
        font-size: 2.5rem;
        margin-bottom: 1rem;
        font-weight: 700;
      }

      p {
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
        opacity: 0.9;
      }

      .error-details {
        font-size: 0.95rem;
        opacity: 0.7;
        margin-bottom: 2rem;
      }

      .actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
      }

      button {
        padding: 12px 30px;
        font-size: 1rem;
        font-weight: 600;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .primary-btn {
        background: white;
        color: #667eea;
      }

      .primary-btn:hover {
        background: #f0f0f0;
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      }

      .secondary-btn {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: 2px solid white;
      }

      .secondary-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-2px);
      }
    `,
  ],
})
export class ErrorFallbackComponent {
  constructor(private router: Router) {}

  returnToLobby() {
    this.router.navigate(['/']);
  }

  refresh() {
    window.location.reload();
  }
}
