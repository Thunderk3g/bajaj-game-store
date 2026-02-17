import { Routes } from '@angular/router';
import { LobbyComponent } from './features/game-dispatcher/lobby.component';
import { GameWrapperComponent } from './shared/components/game-wrapper/game-wrapper.component';
import { ErrorFallbackComponent } from './shared/components/error-fallback/error-fallback.component';
import { SessionExpiredComponent } from './shared/components/session-expired/session-expired.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: LobbyComponent,
  },
  {
    path: 'play/:gameId',
    component: GameWrapperComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'session-expired',
    component: SessionExpiredComponent,
  },
  {
    path: 'error',
    component: ErrorFallbackComponent,
  },
  {
    // Catch API game IDs like GAME_001, GAME_002, etc.
    // LobbyComponent reads :gameId + ?token= and dispatches to the correct game.
    path: ':gameId',
    component: LobbyComponent,
  },
  {
    path: '**',
    redirectTo: '/',
  },
];
