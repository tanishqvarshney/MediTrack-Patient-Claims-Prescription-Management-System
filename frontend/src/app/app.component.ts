import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from './core/auth/auth.service';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  roles: string[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatListModule,
    MatIconModule, MatButtonModule, MatTooltipModule, MatMenuModule
  ],
  template: `
    @if (auth.isAuthenticated) {
      <mat-sidenav-container class="app-container">
        <!-- Sidebar -->
        <mat-sidenav mode="side" opened class="sidenav" [class.collapsed]="collapsed()">
          <!-- Logo -->
          <div class="sidenav-logo">
            <mat-icon class="logo-icon">local_hospital</mat-icon>
            @if (!collapsed()) {
              <span class="logo-text">MediTrack</span>
            }
          </div>

          <mat-nav-list>
            @for (item of visibleNavItems(); track item.route) {
              <a mat-list-item [routerLink]="item.route" routerLinkActive="active-nav"
                [matTooltip]="collapsed() ? item.label : ''" matTooltipPosition="right">
                <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
                @if (!collapsed()) {
                  <span matListItemTitle>{{ item.label }}</span>
                }
              </a>
            }
          </mat-nav-list>

          <!-- Collapse toggle -->
          <div class="sidenav-footer">
            <button mat-icon-button (click)="collapsed.set(!collapsed())"
              [matTooltip]="collapsed() ? 'Expand' : 'Collapse'" matTooltipPosition="right">
              <mat-icon>{{ collapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
            </button>
          </div>
        </mat-sidenav>

        <!-- Main Content -->
        <mat-sidenav-content class="main-content">
          <!-- Top Toolbar -->
          <mat-toolbar class="top-bar">
            <span class="spacer"></span>
            <button mat-button [matMenuTriggerFor]="userMenu" class="user-btn">
              <mat-icon>account_circle</mat-icon>
              @if (auth.currentUser(); as u) {
                <span>{{ u.email }}</span>
                <span class="role-chip">{{ u.role }}</span>
              }
            </button>
            <mat-menu #userMenu="matMenu">
              <button mat-menu-item (click)="auth.logout()">
                <mat-icon>logout</mat-icon> Sign Out
              </button>
            </mat-menu>
          </mat-toolbar>

          <!-- Router outlet -->
          <div class="content-area">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    } @else {
      <router-outlet></router-outlet>
    }
  `,
  styles: [`
    :host { display: block; height: 100vh; }
    .app-container { height: 100%; }

    /* Sidenav */
    .sidenav {
      width: 240px; background: #0d1b2a; color: #fff;
      display: flex; flex-direction: column;
      transition: width 0.3s ease;
    }
    .sidenav.collapsed { width: 64px; }
    .sidenav-logo {
      display: flex; align-items: center; gap: 12px;
      padding: 20px 16px; border-bottom: 1px solid rgba(255,255,255,.1);
    }
    .logo-icon { color: #42a5f5; font-size: 28px; }
    .logo-text { font-size: 18px; font-weight: 700; color: #fff; }
    mat-nav-list { flex: 1; padding-top: 8px; }
    mat-nav-list a {
      color: rgba(255,255,255,.7) !important;
      border-radius: 8px; margin: 2px 8px;
      transition: background 0.2s;
    }
    mat-nav-list a:hover { background: rgba(255,255,255,.08) !important; color: #fff !important; }
    mat-nav-list a.active-nav { background: rgba(66,165,245,.2) !important; color: #42a5f5 !important; }
    mat-nav-list a.active-nav mat-icon { color: #42a5f5 !important; }
    .sidenav-footer { padding: 12px 8px; border-top: 1px solid rgba(255,255,255,.1); }

    /* Top bar */
    .top-bar { background: #fff; border-bottom: 1px solid #e0e0e0; z-index: 10; }
    .spacer { flex: 1; }
    .user-btn { display: flex; align-items: center; gap: 8px; }
    .role-chip {
      background: #e3f2fd; color: #1565c0; padding: 2px 10px;
      border-radius: 12px; font-size: 12px; font-weight: 600;
    }

    /* Content */
    .main-content { display: flex; flex-direction: column; background: #f5f7fa; }
    .content-area { flex: 1; overflow-y: auto; }
  `]
})
export class AppComponent {
  auth = inject(AuthService);
  collapsed = signal(false);

  private navItems: NavItem[] = [
    { icon: 'receipt_long', label: 'Claims',     route: '/claims',   roles: ['Patient', 'Provider', 'Admin'] },
    { icon: 'medication',   label: 'Pharmacy',   route: '/pharmacy', roles: ['Patient', 'Provider', 'Admin'] },
    { icon: 'people',       label: 'Patients',   route: '/admin/patients',  roles: ['Admin'] },
    { icon: 'medical_information', label: 'Providers', route: '/admin/providers', roles: ['Admin'] },
    { icon: 'dashboard',    label: 'Dashboard',  route: '/admin',    roles: ['Admin'] },
    { icon: 'history',      label: 'Audit Logs', route: '/admin/audit-logs', roles: ['Admin'] },
  ];

  visibleNavItems() {
    const role = this.auth.currentUser()?.role ?? '';
    return this.navItems.filter(n => n.roles.includes(role));
  }
}
