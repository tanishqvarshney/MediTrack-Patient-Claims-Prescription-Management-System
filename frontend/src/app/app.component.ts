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
      width: 280px; background: #020617; color: #fff;
      display: flex; flex-direction: column;
      border-right: 1px solid rgba(255,255,255, 0.05);
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .sidenav.collapsed { width: 80px; }
    
    .sidenav-logo {
      display: flex; align-items: center; gap: 14px;
      padding: 40px 24px;
    }
    .logo-circle {
      width: 44px; height: 44px; background: linear-gradient(135deg, #2563eb, #1d4ed8);
      border-radius: 14px; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
    }
    .logo-icon { color: #fff; font-size: 26px; }
    .logo-text { font-family: 'Outfit', sans-serif; font-size: 24px; font-weight: 800; letter-spacing: -1px; color: #fff; }

    .nav-list { padding: 0 16px; flex: 1; }
    .nav-item {
      height: 56px !important; border-radius: 16px !important;
      margin-bottom: 8px !important; 
      color: #94a3b8 !important;
      transition: var(--transition);
      display: flex !important; align-items: center !important;
    }
    .nav-item * { color: #94a3b8 !important; }
    
    .nav-item mat-icon { transition: var(--transition); opacity: 0.8; }
    
    .nav-item:hover { 
      background: rgba(255,255,255, 0.05) !important; 
    }
    .nav-item:hover * { color: #fff !important; opacity: 1 !important; }
    
    .nav-item.active-nav { 
      background: rgba(37, 99, 235, 0.1) !important; 
      border: 1px solid rgba(37, 99, 235, 0.2) !important;
    }
    .nav-item.active-nav * { color: #60a5fa !important; opacity: 1 !important; font-weight: 700 !important; }

    .sidenav-footer { padding: 24px; border-top: 1px solid rgba(255,255,255, 0.05); }
    .toggle-btn { color: #64748b; }
    .toggle-btn:hover { color: #fff; background: rgba(255,255,255, 0.05); }

    /* Top bar */
    .top-bar {
      height: 80px; padding: 0 32px;
      display: flex; align-items: center;
      border-bottom: 1px solid rgba(255,255,255, 0.05);
      background: rgba(2, 6, 23, 0.8) !important;
      backdrop-filter: blur(20px);
    }
    .breadcrumb { display: flex; align-items: center; gap: 12px; color: #64748b; font-size: 14px; }
    .root-path { font-weight: 500; }
    .current-path { font-weight: 600; color: #fff; }
    .sep { font-size: 20px; color: #334155; }

    .spacer { flex: 1; }
    .actions { display: flex; align-items: center; gap: 24px; }
    
    .action-btn { 
      color: #94a3b8; 
      position: relative;
    }
    .action-btn:hover { background: rgba(255,255,255,0.05); color: #fff; }
    .badge {
      position: absolute; top: 6px; right: 6px;
      background: #ef4444; color: #fff;
      font-size: 9px; font-weight: 800;
      padding: 1px 4px; border-radius: 10px;
      border: 2px solid #020617;
    }
    
    .user-profile { display: flex; align-items: center; gap: 12px; padding: 6px 12px; border-radius: 16px; transition: var(--transition); border: 1px solid transparent; }
    .user-profile:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); }
    .user-info { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.2; margin-right: 14px; }
    .user-email { font-size: 14px; font-weight: 600; color: #fff; }
    .user-role { font-size: 11px; text-transform: uppercase; color: #60a5fa; font-weight: 700; letter-spacing: 0.5px; }
    .avatar {
      width: 44px; height: 44px; background: rgba(37, 99, 235, 0.1); color: #60a5fa;
      border-radius: 14px; display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-family: 'Outfit'; border: 1px solid rgba(37, 99, 235, 0.2);
    }

    .menu-header { font-weight: 700; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }

    /* Content Area */
    .main-content { background: #020617; }
    .content-area { padding: 40px; max-width: 1600px; margin: 0 auto; width: 100%; }
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
