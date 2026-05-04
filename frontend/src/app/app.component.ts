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
            <div class="logo-circle">
              <mat-icon class="logo-icon">local_hospital</mat-icon>
            </div>
            @if (!collapsed()) {
              <span class="logo-text">TanCura</span>
            }
          </div>

          <mat-nav-list class="nav-list">
            @for (item of visibleNavItems(); track item.route) {
              <a mat-list-item [routerLink]="item.route" routerLinkActive="active-nav"
                class="nav-item"
                [matTooltip]="collapsed() ? item.label : ''" matTooltipPosition="right">
                <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
                @if (!collapsed()) {
                  <span matListItemTitle class="nav-label">{{ item.label }}</span>
                }
              </a>
            }
          </mat-nav-list>

          <!-- Collapse toggle -->
          <div class="sidenav-footer">
            <button mat-icon-button (click)="collapsed.set(!collapsed())" class="toggle-btn"
              [matTooltip]="collapsed() ? 'Expand Menu' : 'Collapse Menu'" matTooltipPosition="right">
              <mat-icon>{{ collapsed() ? 'keyboard_double_arrow_right' : 'keyboard_double_arrow_left' }}</mat-icon>
            </button>
          </div>
        </mat-sidenav>

        <!-- Main Content -->
        <mat-sidenav-content class="main-content">
          <!-- Top Toolbar -->
          <mat-toolbar class="top-bar glass">
            <div class="breadcrumb">
              <span class="root-path">Dashboard</span>
              <mat-icon class="sep">chevron_right</mat-icon>
              <span class="current-path">Overview</span>
            </div>
            
            <span class="spacer"></span>

            <div class="actions">
              <button mat-icon-button class="action-btn" matTooltip="Notifications" (click)="toggleNotifications()">
                <mat-icon>notifications</mat-icon>
                <span class="badge">3</span>
              </button>
              
              <button mat-button [matMenuTriggerFor]="userMenu" class="user-profile">
                @if (auth.currentUser(); as u) {
                  <div class="user-info">
                    <span class="user-email">{{ u.email }}</span>
                    <span class="user-role">{{ u.role }}</span>
                  </div>
                  <div class="avatar">
                    {{ u.email[0].toUpperCase() }}
                  </div>
                }
              </button>
            </div>

            <mat-menu #userMenu="matMenu" class="premium-menu">
              <div class="menu-header" mat-menu-item disabled>
                <mat-icon>account_circle</mat-icon>
                <span>My Account</span>
              </div>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="auth.logout()">
                <mat-icon>logout</mat-icon> <span>Sign Out</span>
              </button>
            </mat-menu>
          </mat-toolbar>

          <!-- Router outlet -->
          <div class="content-area slide-up">
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
      width: 260px; background: #0f172a; color: #fff;
      display: flex; flex-direction: column;
      border-right: none;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .sidenav.collapsed { width: 80px; }
    
    .sidenav-logo {
      display: flex; align-items: center; gap: 14px;
      padding: 32px 20px;
    }
    .logo-circle {
      width: 40px; height: 40px; background: var(--primary);
      border-radius: 12px; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }
    .logo-icon { color: #fff; font-size: 24px; }
    .logo-text { font-family: 'Outfit', sans-serif; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #fff; }

    .nav-list { padding: 0 12px; flex: 1; }
    .nav-item {
      height: 52px !important; border-radius: 12px !important;
      margin-bottom: 6px !important; 
      color: #ffffff !important;
      opacity: 1 !important;
      transition: var(--transition);
      display: flex !important; align-items: center !important;
    }
    .nav-item * { color: #ffffff !important; } /* Force all children to white */
    
    .nav-item mat-icon { 
      color: #ffffff !important; 
      transition: var(--transition); 
      opacity: 0.9 !important; 
    }
    .nav-label { color: #ffffff !important; opacity: 1 !important; }

    .nav-item:hover { 
      background: rgba(255,255,255, 0.15) !important; 
    }
    .nav-item:hover * { opacity: 1 !important; }
    
    .nav-item.active-nav { 
      background: var(--primary) !important; 
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
    }
    .nav-item.active-nav * { opacity: 1 !important; font-weight: 700 !important; }

    .sidenav-footer { padding: 20px; border-top: 1px solid rgba(255,255,255, 0.05); }
    .toggle-btn { color: #94a3b8; }
    .toggle-btn:hover { color: #fff; background: rgba(255,255,255, 0.05); }

    /* Top bar */
    .top-bar {
      height: 72px; padding: 0 24px;
      display: flex; align-items: center;
      border-bottom: 1px solid #e2e8f0;
      background: rgba(255,255,255, 0.8) !important;
      backdrop-filter: blur(12px);
    }
    .breadcrumb { display: flex; align-items: center; gap: 8px; color: #64748b; }
    .root-path { font-weight: 500; }
    .current-path { font-weight: 600; color: #1e293b; }
    .sep { font-size: 18px; color: #cbd5e1; }

    .spacer { flex: 1; }
    .actions { display: flex; align-items: center; gap: 16px; }
    
    .action-btn { 
      color: #475569; 
      position: relative;
    }
    .action-btn:hover { background: #f1f5f9; color: var(--primary); }
    .badge {
      position: absolute; top: 4px; right: 4px;
      background: var(--error); color: #fff;
      font-size: 10px; font-weight: 700;
      padding: 2px 5px; border-radius: 10px;
      border: 2px solid #fff;
    }
    
    .user-profile { display: flex; align-items: center; gap: 12px; padding: 4px 8px; border-radius: 12px; transition: var(--transition); }
    .user-profile:hover { background: #f1f5f9; }
    .user-info { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.2; margin-right: 12px; }
    .user-email { font-size: 13px; font-weight: 600; color: #1e293b; }
    .user-role { font-size: 11px; text-transform: uppercase; color: var(--primary); font-weight: 700; }
    .avatar {
      width: 40px; height: 40px; background: var(--primary-light); color: var(--primary);
      border-radius: 12px; display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-family: 'Outfit'; border: 2px solid #fff;
      box-shadow: var(--shadow-sm);
    }

    .menu-header { font-weight: 700; color: var(--text-muted); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }

    /* Content Area */
    .main-content { background: var(--bg-main); }
    .content-area { padding: 32px; max-width: 1400px; margin: 0 auto; width: 100%; }
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

  toggleNotifications() {
    // Placeholder for real notification logic
    alert('TanCura Intelligence: You have 3 pending claim reviews.');
  }
}
