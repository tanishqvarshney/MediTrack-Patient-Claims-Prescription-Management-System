import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="unauthorized-page">
      <mat-icon class="icon">lock</mat-icon>
      <h1>Access Denied</h1>
      <p>You don't have permission to view this page.</p>
      <a mat-raised-button color="primary" routerLink="/claims">Go to Claims</a>
    </div>
  `,
  styles: [`
    .unauthorized-page {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: 80vh; text-align: center;
    }
    .icon { font-size: 72px; width: 72px; height: 72px; color: #e0e0e0; margin-bottom: 16px; }
    h1 { font-size: 32px; margin: 0; }
    p { color: #888; margin: 12px 0 24px; }
  `]
})
export class UnauthorizedComponent {}
