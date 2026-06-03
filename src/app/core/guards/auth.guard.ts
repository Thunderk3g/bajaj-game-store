import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { GamificationStoreService } from '../services/gamification-store.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private store: GamificationStoreService,
    private router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean {
    if (this.store.hasValidState()) {
      console.log('[AuthGuard] Access granted — valid session exists');
      return true;
    }

    console.warn(
      '[AuthGuard] Access denied — no valid session, redirecting to /session-expired',
    );
    this.router.navigate(['/session-expired'], { replaceUrl: true });
    return false;
  }
}
