import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { LoginResponse } from '../../shared/models/models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  const mockLoginResponse: LoginResponse = {
    accessToken: 'mock.access.token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 900,
    role: 'Provider',
    userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        provideRouter([])
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);

    // Clean storage between tests
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false for isAuthenticated when not logged in', () => {
    expect(service.isAuthenticated).toBeFalse();
    expect(service.currentUser()).toBeNull();
  });

  it('login() should store tokens and set currentUser signal', fakeAsync(() => {
    service.login({ email: 'provider@clinic.com', password: 'Password123!' })
      .subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/auth/login'));
    expect(req.request.method).toBe('POST');
    req.flush(mockLoginResponse);
    tick();

    expect(service.isAuthenticated).toBeTrue();
    expect(service.accessToken).toBe('mock.access.token');
    expect(service.currentUser()?.role).toBe('Provider');
    expect(service.currentUser()?.email).toBe('provider@clinic.com');
  }));

  it('login() should persist user to localStorage', fakeAsync(() => {
    service.login({ email: 'provider@clinic.com', password: 'Password123!' }).subscribe();
    httpMock.expectOne(r => r.url.includes('/auth/login')).flush(mockLoginResponse);
    tick();

    const stored = JSON.parse(localStorage.getItem('current_user')!);
    expect(stored.email).toBe('provider@clinic.com');
    expect(stored.role).toBe('Provider');
  }));

  it('hasRole() should return true for matching role', fakeAsync(() => {
    service.login({ email: 'provider@clinic.com', password: 'Password123!' }).subscribe();
    httpMock.expectOne(r => r.url.includes('/auth/login')).flush(mockLoginResponse);
    tick();

    expect(service.hasRole('Provider')).toBeTrue();
    expect(service.hasRole('Admin')).toBeFalse();
    expect(service.hasRole('Patient', 'Provider')).toBeTrue();
  }));

  it('logout() should clear tokens and navigate to login', fakeAsync(() => {
    // First login
    service.login({ email: 'provider@clinic.com', password: 'Password123!' }).subscribe();
    httpMock.expectOne(r => r.url.includes('/auth/login')).flush(mockLoginResponse);
    tick();

    const navSpy = spyOn(router, 'navigate');
    service.logout();

    // Flush the logout API call
    httpMock.expectOne(r => r.url.includes('/auth/logout')).flush({});
    tick();

    expect(service.isAuthenticated).toBeFalse();
    expect(service.currentUser()).toBeNull();
    expect(sessionStorage.getItem('access_token')).toBeNull();
    expect(navSpy).toHaveBeenCalledWith(['/auth/login']);
  }));
});
