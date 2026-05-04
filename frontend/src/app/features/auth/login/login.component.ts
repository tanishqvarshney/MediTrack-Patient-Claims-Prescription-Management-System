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
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <div class="logo">
            <mat-icon>local_hospital</mat-icon>
            <h1>TanCura</h1>
          </div>
          <p class="subtitle">Claims & Prescription Management</p>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="user@clinic.com">
              <mat-icon matSuffix>email</mat-icon>
              @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                <mat-error>Email is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput [type]="showPassword() ? 'text' : 'password'" formControlName="password">
              <button mat-icon-button matSuffix type="button"
                (click)="showPassword.set(!showPassword())">
                <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            @if (error()) {
              <div class="error-banner">{{ error() }}</div>
            }

            <button mat-raised-button color="primary" type="submit"
              class="full-width submit-btn" [disabled]="loading() || form.invalid">
              @if (loading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Sign In
              }
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
    }
    .login-card { width: 420px; padding: 32px; border-radius: 16px; }
    .logo { display: flex; align-items: center; gap: 12px; }
    .logo mat-icon { font-size: 40px; color: #1976d2; }
    h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .subtitle { color: #888; margin: 8px 0 24px; }
    .full-width { width: 100%; }
    .submit-btn { height: 48px; margin-top: 16px; font-size: 16px; }
    .error-banner {
      background: #ffebee; color: #c62828; padding: 12px;
      border-radius: 8px; margin-bottom: 12px; font-size: 14px;
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
