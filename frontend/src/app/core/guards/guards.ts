import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated) return true;
  return router.createUrlTree(['/auth/login']);
};

export const roleGuard = (...allowedRoles: string[]): CanActivateFn =>
  () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (auth.hasRole(...allowedRoles)) return true;
    return router.createUrlTree(['/unauthorized']);
  };
