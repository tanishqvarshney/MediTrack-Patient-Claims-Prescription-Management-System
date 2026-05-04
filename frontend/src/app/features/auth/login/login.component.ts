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
      <!-- High-Fidelity Medical Gradient Background -->
      <div class="tech-bg">
        <div class="neural-overlay"></div>
        <div class="medical-icons-hud">
          <mat-icon class="hud-icon dna">biotech</mat-icon>
          <mat-icon class="hud-icon heart">favorite</mat-icon>
          <mat-icon class="hud-icon ecg">monitor_heart</mat-icon>
          <mat-icon class="hud-icon med">medical_services</mat-icon>
        </div>
        <div class="glow-point-1"></div>
        <div class="glow-point-2"></div>
      </div>

      <!-- External Header Logo -->
      <div class="external-header slide-down">
        <div class="logo-group">
          <div class="logo-t">T</div>
          <div class="logo-text-group">
            <span class="main-brand">TanCura</span>
            <span class="sub-brand">Healthcare Intelligence</span>
          </div>
        </div>
      </div>
      
      <div class="login-wrapper slide-up">
        <mat-card class="login-card glassmorphism">
          <mat-card-header>
            <div class="brand-centered">
              <h1>Sign In to TanCura</h1>
              <p>Your Intelligence Platform for Healthcare</p>
            </div>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="login-form">
              <div class="input-group">
                <label>Work Email</label>
                <div class="premium-input-box">
                  <mat-icon>person_outline</mat-icon>
                  <input type="email" formControlName="email" placeholder="email@company.com">
                </div>
              </div>

              <div class="input-group">
                <label>Password</label>
                <div class="premium-input-box">
                  <mat-icon>lock_outline</mat-icon>
                  <input [type]="showPassword() ? 'text' : 'password'" formControlName="password" placeholder="••••••••">
                </div>
              </div>

              <div class="form-options">
                <span class="forgot">Forgot Password?</span>
              </div>

              @if (error()) {
                <div class="error-banner">
                  <mat-icon>error_outline</mat-icon>
                  <span>{{ error() }}</span>
                </div>
              }

              <button mat-raised-button class="full-width premium-submit-btn" [disabled]="loading() || form.invalid">
                @if (loading()) {
                  <mat-spinner diameter="24" color="accent"></mat-spinner>
                } @else {
                  Sign In
                }
              </button>
            </form>

            <div class="divider">
              <div class="line"></div>
              <span>Optional</span>
              <div class="line"></div>
            </div>

            <div class="social-login">
              <button mat-stroked-button class="social-btn full-width">
                <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" class="btn-icon">
                Sign in with Google
              </button>
              <button mat-stroked-button class="social-btn full-width">
                <mat-icon>group</mat-icon>
                Sign in with SSO
              </button>
            </div>
          </mat-card-content>
          
          <mat-card-footer class="login-footer">
            <div class="footer-links">
              <span>Legal</span>
              <span>About TanCura</span>
              <span>Resources</span>
              <span>Contact</span>
            </div>
            <p>© 2026 TanCura Healthcare Intelligence, Inc. All rights reserved.</p>
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
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #020617;
      overflow: hidden;
      color: #fff;
      font-family: 'Inter', sans-serif;
    }

    /* Medical Theme Background */
    .tech-bg {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e3a8a 100%);
    }
    .neural-overlay {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
      background-size: 40px 40px;
      opacity: 0.4;
    }
    
    .medical-icons-hud { position: absolute; inset: 0; pointer-events: none; }
    .hud-icon {
      position: absolute; color: rgba(255,255,255,0.07); font-size: 50px;
      animation: float 12s infinite ease-in-out;
    }
    .dna { top: 10%; right: 10%; animation-delay: 0s; }
    .heart { bottom: 15%; left: 8%; animation-delay: 3s; }
    .ecg { top: 20%; left: 15%; animation-delay: 6s; }
    .med { bottom: 10%; right: 5%; animation-delay: 9s; }

    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-30px) rotate(10deg); }
    }

    .glow-point-1 {
      position: absolute; top: 15%; right: 5%; width: 600px; height: 600px;
      background: radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, transparent 70%);
      filter: blur(80px);
    }
    .glow-point-2 {
      position: absolute; bottom: 5%; left: -5%; width: 700px; height: 700px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
      filter: blur(100px);
    }

    /* Brand Header */
    .external-header {
      position: absolute; top: 40px; left: 60px; z-index: 30;
    }
    .logo-group { display: flex; align-items: center; gap: 15px; }
    .logo-t {
      font-size: 48px; font-weight: 900; color: #fff;
      font-family: 'Outfit', sans-serif;
      text-shadow: 0 0 25px rgba(255,255,255,0.4);
    }
    .logo-text-group { display: flex; flex-direction: column; line-height: 1; }
    .main-brand { font-size: 32px; font-weight: 800; font-family: 'Outfit'; letter-spacing: -1px; }
    .sub-brand { font-size: 14px; color: #94a3b8; margin-top: 4px; font-weight: 400; }

    .login-wrapper {
      position: relative; z-index: 20; width: 100%; max-width: 520px; padding: 24px;
    }

    /* True Glassmorphism Card */
    .glassmorphism {
      padding: 64px 52px;
      border-radius: 32px !important;
      background: rgba(255, 255, 255, 0.04) !important;
      backdrop-filter: blur(40px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(40px) saturate(180%) !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      box-shadow: 0 40px 120px rgba(0, 0, 0, 0.6) !important;
      color: #fff !important;
    }

    .brand-centered { width: 100%; text-align: center; margin-bottom: 48px; }
    .brand-centered h1 { font-size: 42px; font-weight: 800; margin: 0; color: #fff; letter-spacing: -2px; }
    .brand-centered p { color: #cbd5e1; font-size: 16px; margin: 12px 0 0; }

    .login-form { display: flex; flex-direction: column; gap: 28px; }
    .input-group { display: flex; flex-direction: column; gap: 10px; }
    .input-group label { font-size: 14px; font-weight: 600; color: #f1f5f9; margin-left: 4px; }
    
    .premium-input-box {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      height: 60px;
      display: flex; align-items: center; padding: 0 20px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .premium-input-box:focus-within {
      border-color: #3b82f6;
      background: rgba(255, 255, 255, 0.12);
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
    }
    .premium-input-box mat-icon { color: #94a3b8; margin-right: 14px; font-size: 24px; }
    .premium-input-box input {
      background: transparent; border: none; outline: none;
      color: #fff; font-size: 16px; width: 100%;
    }
    .premium-input-box input::placeholder { color: rgba(255,255,255,0.3); }

    .form-options { display: flex; justify-content: flex-end; margin-top: -12px; }
    .forgot { color: #94a3b8; font-size: 14px; cursor: pointer; transition: color 0.2s; }
    .forgot:hover { color: #fff; }

    /* Dark Blue Gradient Button with Glow */
    .premium-submit-btn {
      height: 64px !important;
      border-radius: 16px !important;
      background: linear-gradient(135deg, #1e3a8a, #1e40af) !important;
      color: #fff !important;
      font-size: 19px !important;
      font-weight: 700 !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      box-shadow: 0 10px 25px rgba(30, 58, 138, 0.4) !important;
      transition: all 0.3s ease !important;
      cursor: pointer;
    }
    .premium-submit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 35px rgba(30, 58, 138, 0.6) !important;
      background: linear-gradient(135deg, #1e40af, #2563eb) !important;
    }
    .premium-submit-btn:active { transform: translateY(0) scale(0.98); }

    .divider {
      display: flex; align-items: center; justify-content: center; gap: 16px; margin: 44px 0;
    }
    .divider .line { height: 1px; flex: 1; background: rgba(255,255,255,0.1); }
    .divider span { color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; }

    .social-login { display: flex; flex-direction: column; gap: 16px; }
    .social-btn {
      height: 60px !important; border-radius: 16px !important;
      background: rgba(255, 255, 255, 0.05) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      color: #f1f5f9 !important; font-weight: 500 !important;
      backdrop-filter: blur(10px) !important;
    }
    .social-btn:hover { background: rgba(255, 255, 255, 0.1) !important; border-color: rgba(255, 255, 255, 0.2) !important; }
    .btn-icon { width: 22px; height: 22px; margin-right: 12px; }

    .login-footer { margin-top: 64px; text-align: center; }
    .footer-links {
      display: flex; justify-content: center; gap: 28px;
      margin-bottom: 24px; color: #94a3b8; font-size: 14px;
    }
    .footer-links span { cursor: pointer; transition: color 0.2s; }
    .footer-links span:hover { color: #fff; }
    .login-footer p { color: #475569; font-size: 12px; margin: 0; }

    .error-banner {
      display: flex; align-items: center; gap: 12px;
      background: rgba(239, 68, 68, 0.1); color: #f87171;
      padding: 16px; border-radius: 14px; border: 1px solid rgba(239, 68, 68, 0.2);
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
