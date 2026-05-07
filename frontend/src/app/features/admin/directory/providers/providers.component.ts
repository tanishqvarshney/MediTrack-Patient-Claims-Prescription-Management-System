import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DirectoryService } from '../../../../core/services/directory.service';
import { Provider } from '../../../../shared/models/models';
import { ProviderFormDialogComponent } from '../../../../shared/components/dialogs/provider-form-dialog.component';

@Component({
  selector: 'app-providers',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatCardModule, 
    MatIconModule, MatButtonModule, MatTooltipModule, MatProgressSpinnerModule,
    MatProgressBarModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatPaginatorModule, MatSnackBarModule, MatDialogModule
  ],
  template: `
    <div class="page-container fade-in">
      <div class="page-header">
        <div class="header-text">
          <h1>Provider Network</h1>
          <p class="subtitle">Real-time orchestration of clinical facilities and specialists</p>
        </div>
        <button mat-raised-button color="primary" class="action-btn" (click)="addProvider()">
          <mat-icon>add_business</mat-icon> <span>Add Provider</span>
        </button>
      </div>

      <div class="filter-bar mat-elevation-z2">
        <div class="search-box">
          <mat-icon>search</mat-icon>
          <input [formControl]="searchControl" placeholder="Search by name, NPI or specialty...">
        </div>
        <div class="filters">
          <mat-form-field appearance="outline" class="specialty-filter">
            <mat-select [formControl]="specialtyFilter" placeholder="Filter Specialty">
              <mat-option value="">All Specialties</mat-option>
              <mat-option value="Cardiology">Cardiology</mat-option>
              <mat-option value="General Practice">General Practice</mat-option>
              <mat-option value="Neurology">Neurology</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <div class="container">
        @if (loading()) {
          <div class="loader">
            <mat-progress-bar mode="indeterminate"></mat-progress-bar>
          </div>
        } @else {
          <div class="table-wrapper mat-elevation-z2">
            <table mat-table [dataSource]="providers()">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Facility / Physician</th>
                <td mat-cell *matCellDef="let p" class="name-cell">
                  <div class="avatar-box">
                    <mat-icon>{{ getIcon(p.specialty) }}</mat-icon>
                  </div>
                  <div class="info-block">
                    <span class="full-name">{{ p.name }}</span>
                    <span class="email">{{ p.email }}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="specialty">
                <th mat-header-cell *matHeaderCellDef>Specialty</th>
                <td mat-cell *matCellDef="let p">
                  <span class="specialty-badge">{{ p.specialty }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="npi">
                <th mat-header-cell *matHeaderCellDef>NPI / License</th>
                <td mat-cell *matCellDef="let p">
                  <code class="npi">{{ p.npi }}</code>
                  <span class="license">{{ p.licenseNumber }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let p">
                  <div class="status-pill" [class.active]="p.isActive">
                    <span class="dot"></span>
                    {{ p.isActive ? 'Active' : 'Inactive' }}
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let p" class="action-cell">
                  <div class="action-buttons">
                    <button mat-icon-button (click)="openSettings(p)" matTooltip="Facility Settings">
                      <mat-icon>settings</mat-icon>
                    </button>
                    <button mat-icon-button (click)="editProvider(p)" matTooltip="Edit Credentials">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="deactivateProvider(p)" matTooltip="Revoke Access">
                      <mat-icon>block</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="row-item"></tr>
            </table>

            <mat-paginator
              class="premium-paginator"
              [length]="total()"
              [pageSize]="pageSize"
              [pageSizeOptions]="[10, 25, 50]"
              (page)="onPageChange($event)"
              showFirstLastButtons>
            </mat-paginator>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 32px; max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
    h1 { font-family: 'Outfit', sans-serif; font-size: 32px; font-weight: 800; margin: 0; }
    .subtitle { color: var(--text-muted); margin: 4px 0 0; font-size: 15px; font-weight: 500; }
    .action-btn { height: 48px !important; border-radius: 12px !important; padding: 0 24px !important; }

    .filter-bar {
      background: var(--bg-card-light); border-radius: 16px; margin-bottom: 24px; 
      padding: 8px 24px; border: 1px solid rgba(255,255,255,0.4); backdrop-filter: blur(20px);
      display: flex; align-items: center; justify-content: space-between; gap: 24px;
    }
    .search-box { flex: 1; display: flex; align-items: center; gap: 12px; }
    .search-box mat-icon { color: var(--text-on-light-light); }
    .search-box input {
      border: none; background: transparent; outline: none; width: 100%;
      font-size: 14px; font-weight: 500; color: var(--text-on-light);
    }
    .specialty-filter { width: 220px; margin-bottom: -1.25em; }

    .container { margin-top: 16px; }

    /* Table Wrapper */
    .table-wrapper { 
      background: var(--bg-card-light); border-radius: 20px; overflow: hidden; 
      border: 1px solid rgba(255,255,255,0.4); backdrop-filter: blur(20px);
      box-shadow: var(--shadow-lg);
    }
    
    table { width: 100%; border-collapse: separate; border-spacing: 0; background: transparent !important; }
    
    .mat-mdc-header-cell {
      padding: 16px 24px !important;
      background: rgba(15, 23, 42, 0.02) !important;
      color: var(--text-on-light-muted) !important;
      font-size: 11px !important;
      font-weight: 700 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.8px !important;
      border-bottom: 1px solid rgba(15, 23, 42, 0.05) !important;
    }

    .mat-mdc-cell { 
      padding: 16px 24px !important; 
      border-bottom: 1px solid rgba(15, 23, 42, 0.03) !important; 
      color: var(--text-on-light) !important; 
      font-size: 14px;
    }

    .row-item { transition: var(--transition); }
    .row-item:hover { background: rgba(15, 23, 42, 0.02) !important; }

    .name-cell { display: flex; align-items: center; gap: 16px; }
    .info-block { display: flex; flex-direction: column; gap: 2px; }
    
    .avatar-box {
      width: 40px; height: 40px; border-radius: 10px; 
      background: rgba(59, 130, 246, 0.1); color: var(--primary);
      display: flex; align-items: center; justify-content: center;
    }

    .full-name { font-weight: 700; color: var(--text-on-light); font-size: 15px; }
    .email { font-size: 12px; color: var(--text-on-light-muted); font-weight: 500; }

    .specialty-badge {
      background: rgba(16, 185, 129, 0.1); color: #10b981; 
      padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: 700;
    }

    .npi { display: block; background: rgba(15, 23, 42, 0.05); padding: 2px 6px; border-radius: 4px; font-size: 12px; width: fit-content; }
    .license { font-size: 11px; color: var(--text-on-light-muted); font-weight: 600; margin-top: 4px; display: block; }

    .status-pill {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: 800;
      background: rgba(15, 23, 42, 0.05); color: var(--text-on-light-muted);
    }
    .status-pill.active { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .status-pill .dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

    .action-cell { width: 140px; }
    .action-buttons { display: flex; gap: 4px; opacity: 0.6; transition: 0.2s; }
    .row-item:hover .action-buttons { opacity: 1; }

    .premium-paginator { background: transparent !important; color: var(--text-on-light) !important; }
  `]
})
export class ProvidersComponent implements OnInit {
  private directory = inject(DirectoryService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  
  providers = signal<Provider[]>([]);
  total = signal(0);
  loading = signal(true);
  displayedColumns = ['name', 'specialty', 'npi', 'status', 'actions'];

  searchControl = new FormControl('');
  specialtyFilter = new FormControl('');
  page = 1;
  pageSize = 10;

  constructor() {
    this.searchControl.valueChanges.pipe(debounceTime(300), takeUntilDestroyed()).subscribe(() => this.loadProviders());
    this.specialtyFilter.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.loadProviders());
  }

  ngOnInit() { this.loadProviders(); }

  loadProviders() {
    this.loading.set(true);
    this.directory.getProviders().subscribe({
      next: (data) => {
        let filtered = data;
        if (this.searchControl.value) {
          const q = this.searchControl.value.toLowerCase();
          filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.npi.includes(q) || p.specialty.toLowerCase().includes(q));
        }
        if (this.specialtyFilter.value) {
          filtered = filtered.filter(p => p.specialty.includes(this.specialtyFilter.value!));
        }
        this.providers.set(filtered);
        this.total.set(filtered.length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onPageChange(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadProviders();
  }

  addProvider() {
    const dialogRef = this.dialog.open(ProviderFormDialogComponent, { width: '800px', disableClose: true });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.directory.addProvider(result).subscribe(() => {
          this.loadProviders();
          this.snackBar.open('New Provider Registered Successfully', 'Success', { duration: 3000 });
        });
      }
    });
  }

  openSettings(p: Provider) {
    this.snackBar.open(`Configuring Facility Orchestration: ${p.name}`, 'Authorized', { duration: 2000 });
  }

  editProvider(p: Provider) {
    const dialogRef = this.dialog.open(ProviderFormDialogComponent, { width: '800px', data: p, disableClose: true });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.directory.updateProvider(p.providerId, result).subscribe(() => {
          this.loadProviders();
          this.snackBar.open('Provider Credentials Synchronized', 'Success', { duration: 3000 });
        });
      }
    });
  }

  deactivateProvider(p: Provider) {
    if (confirm(`Are you sure you want to revoke access for ${p.name}?`)) {
      this.directory.deactivateProvider(p.providerId).subscribe(() => {
        this.loadProviders();
        this.snackBar.open('Network Access Revoked', 'Warning', { duration: 3000 });
      });
    }
  }

  getIcon(specialty: string): string {
    if (specialty.includes('Cardiology')) return 'favorite';
    if (specialty.includes('General')) return 'medical_services';
    if (specialty.includes('Neurology')) return 'psychology';
    return 'health_and_safety';
  }
}
