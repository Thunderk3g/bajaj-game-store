import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';

// ── Interfaces ──────────────────────────────────────────────────

export interface SalesPerson {
  id: string;
  name: string;
  region: string;
  [key: string]: any;
}

export interface GameDetails {
  id: string;
  desc: string;
  url: string;
  thumbnail: string;
  [key: string]: any;
}

export interface GamificationState {
  salesPerson: SalesPerson;
  gameDetails: GameDetails;
  rawToken: string;
  authenticatedAt: number;
}

// ── Service ─────────────────────────────────────────────────────

@Injectable({
  providedIn: 'root',
})
export class GamificationStoreService {
  private readonly stateSubject = new BehaviorSubject<GamificationState | null>(
    null,
  );

  /** Full state observable */
  readonly state$: Observable<GamificationState | null> =
    this.stateSubject.asObservable();

  /** Derived observable: sales person info */
  readonly salesPerson$: Observable<SalesPerson | null> = this.state$.pipe(
    map((s) => s?.salesPerson ?? null),
  );

  /** Derived observable: game details */
  readonly gameDetails$: Observable<GameDetails | null> = this.state$.pipe(
    map((s) => s?.gameDetails ?? null),
  );

  /** Push decoded JWT payload into the store */
  setState(
    salesPerson: SalesPerson,
    gameDetails: GameDetails,
    rawToken: string,
  ): void {
    const state: GamificationState = {
      salesPerson,
      gameDetails,
      rawToken,
      authenticatedAt: Date.now(),
    };
    this.stateSubject.next(state);
    console.log('[GamificationStore] State set:', {
      salesPersonId: salesPerson.id,
      gameId: gameDetails.id,
    });
  }

  /** Get current snapshot (non-reactive) */
  getSnapshot(): GamificationState | null {
    return this.stateSubject.getValue();
  }

  /** Check if valid data exists in the store */
  hasValidState(): boolean {
    const state = this.getSnapshot();
    return !!(
      state &&
      state.salesPerson?.id &&
      state.gameDetails?.id &&
      state.gameDetails?.url
    );
  }

  /** Get the sales person ID */
  getSalesPersonId(): string | null {
    return this.getSnapshot()?.salesPerson?.id ?? null;
  }

  /** Get the game details */
  getGameDetails(): GameDetails | null {
    return this.getSnapshot()?.gameDetails ?? null;
  }

  /**
   * Get the constructed game iframe URL.
   *
   * For local monolithic games (localhost/assets), we MUST use query parameters
   * because static file servers don't support path parameters on subfolders
   * (causes 404 or recursion).
   *
   * For remote URLs, we use the requested path parameter format.
   */
  getConstructedGameUrl(): string | null {
    const state = this.getSnapshot();
    if (!state) return null;

    const { salesPerson, gameDetails } = state;
    if (!gameDetails.url || !salesPerson.id || !gameDetails.id) return null;

    // Strip any query string that may already be baked into the stored URL
    // (e.g. from a previously constructed URL being saved back into state).
    // Also strip a trailing "index.html" so we always start from the bare
    // directory path and re-append it consistently below.
    const rawUrl = gameDetails.url.split('?')[0].replace(/\/index\.html$/, '');

    const isLocal =
      rawUrl.includes('localhost') ||
      rawUrl.includes('assets/games');
    const baseUrl = rawUrl.replace(/\/$/, '');

    if (isLocal) {
      // Local static files need index.html + query params to avoid 404 recursion
      return `${baseUrl}/index.html?salesPersonId=${encodeURIComponent(salesPerson.id)}&gameId=${encodeURIComponent(gameDetails.id)}`;
    } else {
      // Remote apps handle path parameters as requested
      return `${baseUrl}/${encodeURIComponent(salesPerson.id)}/${encodeURIComponent(gameDetails.id)}`;
    }
  }

  /** Clear the store (logout / session end) */
  clearState(): void {
    this.stateSubject.next(null);
    console.log('[GamificationStore] State cleared');
  }
}
