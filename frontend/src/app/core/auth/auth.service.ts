import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { CurrentUser, LoginRequest, LoginResponse } from '../../shared/models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _user = signal<CurrentUser | null>(this.loadUserFromStorage());
  readonly currentUser = this._user.asReadonly();

  get accessToken(): string | null {
    return sessionStorage.getItem('access_token');
  }

  get isAuthenticated(): boolean {
    return !!this._user();
  }

  login(request: LoginRequest) {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, request).pipe(
      tap(response => {
        sessionStorage.setItem('access_token', response.accessToken);
        localStorage.setItem('refresh_token', response.refreshToken);
        const user: CurrentUser = {
          userId: response.userId,
          email: request.email,
          role: response.role
        };
        localStorage.setItem('current_user', JSON.stringify(user));
        this._user.set(user);
      })
    );
  }

  refresh() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return null;
    return this.http.post<LoginResponse>(
      `${environment.apiUrl}/auth/refresh`, { refreshToken }
    ).pipe(
      tap(response => {
        sessionStorage.setItem('access_token', response.accessToken);
        localStorage.setItem('refresh_token', response.refreshToken);
      })
    );
  }

  logout() {
    this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe();
    sessionStorage.clear();
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
    this._user.set(null);
    this.router.navigate(['/auth/login']);
  }

  hasRole(...roles: string[]): boolean {
    return roles.includes(this._user()?.role ?? '');
  }

  private loadUserFromStorage(): CurrentUser | null {
    try {
      const raw = localStorage.getItem('current_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
