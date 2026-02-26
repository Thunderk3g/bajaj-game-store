import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/game-dispatcher/lobby.component').then(
        (m) => m.LobbyComponent,
      ),
  },
  {
    path: 'play/:gameId',
    loadComponent: () =>
      import('./shared/components/game-wrapper/game-wrapper.component').then(
        (m) => m.GameWrapperComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'life-snakes-ladders',
    loadComponent: () =>
      import('./shared/components/game-wrapper/game-wrapper.component').then(
        (m) => m.GameWrapperComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'session-expired',
    loadComponent: () =>
      import('./shared/components/session-expired/session-expired.component').then(
        (m) => m.SessionExpiredComponent,
      ),
  },
  {
    path: 'error',
    loadComponent: () =>
      import('./shared/components/error-fallback/error-fallback.component').then(
        (m) => m.ErrorFallbackComponent,
      ),
  },
  {
    // Catch API game IDs like GAME_001, GAME_002, etc.
    // LobbyComponent reads :gameId + ?token= and dispatches to the correct game.
    path: ':gameId',
    loadComponent: () =>
      import('./features/game-dispatcher/lobby.component').then(
        (m) => m.LobbyComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '/',
  },
];
