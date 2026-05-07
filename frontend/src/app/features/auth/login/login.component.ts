import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="login-container">
      <div class="login-card fade-in">
        <div class="logo-section">
          <div class="logo-circle">
            <mat-icon>local_hospital</mat-icon>
          </div>
          <h1>TanCura</h1>
          <p>Clinical Orchestration Hub</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="input-group">
            <label>Email Address</label>
            <div class="pill-input">
              <mat-icon>email</mat-icon>
              <input type="email" formControlName="email" placeholder="name@tancura.io">
            </div>
          </div>

          <div class="input-group">
            <label>Password</label>
            <div class="pill-input">
              <mat-icon>lock</mat-icon>
              <input type="password" formControlName="password" placeholder="••••••••">
            </div>
          </div>

          @if (error()) {
            <div class="error-message">
              <mat-icon>error_outline</mat-icon>
              <span>{{ error() }}</span>
            </div>
          }

          <button type="submit" class="login-btn" [disabled]="loginForm.invalid || loading()">
            @if (loading()) {
              <mat-spinner diameter="24"></mat-spinner>
            } @else {
              Access Workspace
            }
          </button>
        </form>

        <div class="demo-creds">
          <h4>Clinical Demo Credentials</h4>
          <p>Admin: <strong>admin&#64;tancura.io</strong></p>
          <p>Password: <strong>TanCura123!</strong></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: #f1f5f9; position: relative; overflow: hidden;
    }
    
    .login-card {
      width: 440px; background: #ffffff; border-radius: 32px; padding: 56px;
      border: 1px solid #e2e8f0; box-shadow: 0 40px 100px rgba(15, 23, 42, 0.1);
      position: relative; z-index: 10;
    }
    
    .logo-section { text-align: center; margin-bottom: 48px; }
    .logo-circle {
      width: 64px; height: 64px; background: var(--primary);
      border-radius: 20px; display: flex; align-items: center; justify-content: center;
      margin: 0 auto 20px; box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2);
    }
    .logo-circle mat-icon { color: #fff; font-size: 32px; width: 32px; height: 32px; }
    .logo-section h1 { font-size: 32px; font-weight: 800; color: var(--text-main); margin: 0; letter-spacing: -1px; }
    .logo-section p { color: var(--text-muted); font-size: 16px; margin-top: 8px; font-weight: 500; }

    .input-group { margin-bottom: 24px; }
    .input-group label { display: block; font-size: 13px; font-weight: 700; color: var(--text-main); margin-bottom: 8px; margin-left: 4px; }
    
    .pill-input {
      display: flex; align-items: center; background: #f8fafc;
      border: 1px solid #e2e8f0; border-radius: 16px; height: 56px;
      padding: 0 20px; gap: 12px; transition: var(--transition);
    }
    .pill-input:focus-within { background: #fff; border-color: var(--primary); box-shadow: 0 0 0 4px var(--primary-light); }
    .pill-input mat-icon { color: #94a3b8; font-size: 20px; width: 20px; height: 20px; }
    .pill-input input { background: transparent; border: none; outline: none; width: 100%; font-size: 15px; color: var(--text-main); font-weight: 600; }

    .error-message {
      background: #fff1f2; color: var(--error); border-radius: 12px;
      padding: 12px 16px; margin-bottom: 24px; display: flex; align-items: center; gap: 10px;
      font-size: 13px; font-weight: 600;
    }

    .login-btn {
      width: 100%; height: 56px; background: var(--primary); color: #fff;
      border: none; border-radius: 16px; font-size: 16px; font-weight: 700;
      cursor: pointer; margin-top: 12px; transition: var(--transition);
      box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2);
      display: flex; align-items: center; justify-content: center;
    }
    .login-btn:hover { background: var(--primary-hover); transform: translateY(-2px); box-shadow: 0 15px 30px rgba(37, 99, 235, 0.3); }
    .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .demo-creds {
      margin-top: 40px; padding: 20px; background: #f8fafc;
      border-radius: 20px; border: 1px solid #e2e8f0;
    }
    .demo-creds h4 { font-size: 12px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0; }
    .demo-creds p { font-size: 13px; color: var(--text-muted); margin: 4px 0; font-weight: 600; }
    .demo-creds strong { color: var(--text-main); }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  loading = signal(false);
  error = signal<string | null>(null);

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    this.auth.login(this.loginForm.value as any).subscribe({
      next: (res) => {
        if (res.role === 'Admin') this.router.navigate(['/admin']);
        else if (res.role === 'Provider') this.router.navigate(['/claims']);
        else this.router.navigate(['/claims']);
      },
      error: (err) => {
        this.error.set(err.message || 'Invalid clinical credentials');
        this.loading.set(false);
      }
    });
  }
}
