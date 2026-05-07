import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable, of, throwError, delay } from 'rxjs';
import { CurrentUser, LoginRequest, LoginResponse, UserRole } from '../../shared/models/models';
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

  login(request: LoginRequest): Observable<LoginResponse> {
    console.log('AuthService: Login attempt with', request.email);
    
    // Temporary Mock Login for UI Demonstration
    const testUsers: Record<string, { role: UserRole }> = {
      'admin@tancura.io': { role: 'Admin' },
      'provider@clinic.com': { role: 'Provider' },
      'patient@example.com': { role: 'Patient' }
    };

    const email = request.email.trim().toLowerCase();
    const password = request.password.trim();
    const userMatch = testUsers[email];

    if (userMatch) {
      if (password === 'TanCura123!') {
        console.log('AuthService: Mock login matched for', email);
        const response: LoginResponse = {
          accessToken: 'mock_access_token',
          refreshToken: 'mock_refresh_token',
          userId: 'mock_user_id',
          role: userMatch.role,
          expiresIn: 3600
        };
        
        sessionStorage.setItem('access_token', response.accessToken);
        localStorage.setItem('refresh_token', response.refreshToken);
        const user: CurrentUser = {
          userId: response.userId,
          email: email,
          role: response.role
        };
        localStorage.setItem('current_user', JSON.stringify(user));
        this._user.set(user);
        
        return of(response).pipe(delay(1000));
      } else {
        console.log('AuthService: Incorrect password for', email);
        return throwError(() => ({ status: 401, message: 'Invalid credentials' })).pipe(delay(1000));
      }
    }

    console.log('AuthService: User not found in mock, falling back to API');
    // Fallback to real API
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
