import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule
  ],
  template: `
    <div class="login-page">
      <div class="mesh-gradient"></div>
      
      <div class="login-wrapper slide-up">
        <mat-card class="login-card glass">
          <mat-card-header>
            <div class="brand">
              <div class="logo-box">
                <mat-icon>local_hospital</mat-icon>
              </div>
              <div class="brand-text">
                <h1>TanCura</h1>
                <p>Healthcare Intelligence Platform</p>
              </div>
            </div>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="login-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email Address</mat-label>
                <input matInput type="email" formControlName="email" placeholder="name@example.com">
                <mat-icon matSuffix class="field-icon">email</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Password</mat-label>
                <input matInput [type]="showPassword() ? 'text' : 'password'" formControlName="password">
                <button mat-icon-button matSuffix type="button" class="field-icon"
                  (click)="showPassword.set(!showPassword())">
                  <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </mat-form-field>

              @if (error()) {
                <div class="error-banner">
                  <mat-icon>report_problem</mat-icon>
                  <span>{{ error() }}</span>
                </div>
              }

              <button mat-raised-button color="primary" type="submit"
                class="full-width submit-btn" [disabled]="loading() || form.invalid">
                @if (loading()) {
                  <mat-spinner diameter="24"></mat-spinner>
                } @else {
                  Sign In to TanCura
                }
              </button>
            </form>
          </mat-card-content>
          
          <mat-card-footer class="login-footer">
            <p>© 2026 TanCura Global. All rights reserved.</p>
          </mat-card-footer>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      position: relative;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0f172a;
      overflow: hidden;
    }

    .mesh-gradient {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: 
        radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.15) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(59, 130, 246, 0.1) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(37, 99, 235, 0.1) 0px, transparent 50%);
      filter: blur(80px);
    }

    .login-wrapper {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 440px;
      padding: 20px;
    }

    .login-card {
      padding: 40px 32px;
      border-radius: 24px !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 32px;
    }

    .logo-box {
      width: 52px; height: 52px;
      background: var(--primary);
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 8px 16px rgba(37, 99, 235, 0.4);
    }

    .logo-box mat-icon { color: #fff; font-size: 32px; width: 32px; height: 32px; }

    .brand-text h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 32px;
      font-weight: 800;
      margin: 0;
      letter-spacing: -1px;
      color: var(--text-main);
    }

    .brand-text p {
      margin: 0;
      color: var(--text-muted);
      font-size: 14px;
      font-weight: 500;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .field-icon { color: #94a3b8; }

    .submit-btn {
      height: 56px !important;
      margin-top: 16px;
      font-size: 16px !important;
      border-radius: 14px !important;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #fef2f2;
      color: #991b1b;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
      border: 1px solid #fee2e2;
    }

    .login-footer {
      margin-top: 32px;
      text-align: center;
      color: var(--text-light);
      font-size: 12px;
    }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  loading = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    const { email, password } = this.form.value;
    this.auth.login({ email: email!, password: password! }).subscribe({
      next: () => this.router.navigate(['/claims']),
      error: (err) => {
        this.error.set(err.status === 401 ? 'Invalid email or password' : 'Login failed. Try again.');
        this.loading.set(false);
      }
    });
  }
}
