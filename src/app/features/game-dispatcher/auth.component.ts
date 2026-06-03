import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SecurityService } from '../../core/services/security.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="auth-container">
      <div class="auth-content">
        <div class="spinner"></div>
        <p>Authenticating...</p>
        <p class="error" *ngIf="error">{{ errorMessage }}</p>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-container {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        text-align: center;
      }

      .auth-content {
        padding: 40px;
      }

      .spinner {
        width: 50px;
        height: 50px;
        margin: 0 auto 20px;
        border: 5px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      p {
        font-size: 1.2rem;
        margin: 10px 0;
      }

      .error {
        color: #ffcccc;
        font-weight: 600;
      }
    `,
  ],
})
export class AuthComponent implements OnInit {
  error = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private securityService: SecurityService,
  ) { }

  ngOnInit() {
    // Extract token from query parameter
    this.route.queryParams.subscribe(async (params) => {
      const token = params['token'];

      if (!token) {
        this.showError('No authentication token provided');
        return;
      }

      // Authenticate and extract gameId
      const gameId = await this.securityService.authenticateWithToken(token);

      if (!gameId) {
        this.showError('Invalid or expired authentication token');
        return;
      }

      // Navigate to game with clean URL (no token in URL)
      this.securityService.secureNavigateToGame(gameId);
    });
  }

  private showError(message: string) {
    this.error = true;
    this.errorMessage = message;

    // Redirect to lobby after 3 seconds
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 3000);
  }
}
