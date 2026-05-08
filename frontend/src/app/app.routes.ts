import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/guards';

export const routes: Routes = [
  { path: '', redirectTo: 'claims', pathMatch: 'full' },

  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'claims',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/claims/claims.routes').then(m => m.CLAIMS_ROUTES)
  },
  {
    path: 'pharmacy',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/pharmacy/pharmacy.routes').then(m => m.PHARMACY_ROUTES)
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/settings/settings.component').then(m => m.SettingsComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard('Admin')],
    loadChildren: () =>
      import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./shared/components/unauthorized/unauthorized.component')
        .then(m => m.UnauthorizedComponent)
  },
  { path: '**', redirectTo: 'claims' }
];
