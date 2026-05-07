import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
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
import { Patient } from '../../../../shared/models/models';
import { PatientFormDialogComponent } from '../../../../shared/components/dialogs/patient-form-dialog.component';
import { PatientDetailDialogComponent } from '../../../../shared/components/dialogs/patient-detail-dialog.component';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatCardModule, 
    MatIconModule, MatButtonModule, MatTooltipModule, MatProgressSpinnerModule,
    MatProgressBarModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatPaginatorModule, MatSnackBarModule, DatePipe, MatDialogModule
  ],
  template: `
    <div class="page-container fade-in">
      <div class="page-header">
        <div class="header-text">
          <h1>Patient Directory</h1>
          <p class="subtitle">Orchestration of member records and clinical profiles</p>
        </div>
        <button mat-raised-button color="primary" class="action-btn" (click)="addPatient()">
          <mat-icon>person_add</mat-icon> <span>New Patient</span>
        </button>
      </div>

      <div class="filter-bar mat-elevation-z2">
        <div class="search-box">
          <mat-icon>search</mat-icon>
          <input [formControl]="searchControl" placeholder="Search by name, ID or email...">
        </div>
        <div class="filters">
          <mat-form-field appearance="outline" class="plan-filter">
            <mat-select [formControl]="planFilter" placeholder="Filter by Plan">
              <mat-option value="">All Plans</mat-option>
              <mat-option value="Gold">Gold PPO</mat-option>
              <mat-option value="Silver">Silver HMO</mat-option>
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
            <table mat-table [dataSource]="patients()">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Patient Profile</th>
                <td mat-cell *matCellDef="let p" class="name-cell">
                  <div class="avatar" [style.background]="p.gender === 'Male' ? 'rgba(59,130,246,0.1)' : 'rgba(236,72,153,0.1)'">
                    {{ p.firstName[0] }}{{ p.lastName[0] }}
                  </div>
                  <div class="info-block">
                    <span class="full-name">{{ p.firstName }} {{ p.lastName }}</span>
                    <span class="email">{{ p.email }}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="memberId">
                <th mat-header-cell *matHeaderCellDef>Member ID</th>
                <td mat-cell *matCellDef="let p"><code>{{ p.memberId }}</code></td>
              </ng-container>

              <ng-container matColumnDef="plan">
                <th mat-header-cell *matHeaderCellDef>Insurance Plan</th>
                <td mat-cell *matCellDef="let p">
                  <span class="plan-chip" [class.gold]="p.insurancePlan?.planName?.includes('Gold')">
                    {{ p.insurancePlan?.planName || 'Self-Pay' }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="dob">
                <th mat-header-cell *matHeaderCellDef>DOB</th>
                <td mat-cell *matCellDef="let p">{{ p.dateOfBirth | date:'MMM d, yyyy' }}</td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let p">
                  <span class="status-pill" [class.active]="p.isActive">
                    {{ p.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let p" class="action-cell">
                  <div class="action-buttons">
                    <button mat-icon-button (click)="viewProfile(p)" matTooltip="View Clinical Profile">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button mat-icon-button (click)="editPatient(p)" matTooltip="Edit Records">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="deletePatient(p)" matTooltip="Deactivate Member">
                      <mat-icon>delete_outline</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="row-item"></tr>

              <tr class="no-data-row" *matNoDataRow>
                <td [attr.colspan]="displayedColumns.length">
                  <div class="empty-state">
                    <mat-icon>group_off</mat-icon>
                    <h3>No patients found</h3>
                    <p>Adjust your search or filters to find specific member records.</p>
                  </div>
                </td>
              </tr>
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
    .plan-filter { width: 200px; margin-bottom: -1.25em; }

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
    
    .avatar {
      width: 40px; height: 40px; border-radius: 10px; 
      color: var(--primary); display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 14px;
    }

    .full-name { font-weight: 700; color: var(--text-on-light); font-size: 15px; }
    .email { font-size: 12px; color: var(--text-on-light-muted); font-weight: 500; }

    .plan-chip {
      background: rgba(59, 130, 246, 0.1); color: #3b82f6; 
      padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: 700;
    }
    .plan-chip.gold { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

    .status-pill {
      padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: 800;
      background: rgba(15, 23, 42, 0.05); color: var(--text-on-light-muted);
    }
    .status-pill.active { background: rgba(16, 185, 129, 0.1); color: #10b981; }

    code { background: rgba(15, 23, 42, 0.05); padding: 4px 8px; border-radius: 6px; font-size: 13px; color: var(--text-on-light); }

    .action-cell { width: 140px; }
    .action-buttons { display: flex; gap: 4px; opacity: 0.6; transition: 0.2s; }
    .row-item:hover .action-buttons { opacity: 1; }

    .empty-state { text-align: center; padding: 64px; color: var(--text-on-light-muted); }
    .empty-state mat-icon { font-size: 56px; width: 56px; height: 56px; margin-bottom: 16px; opacity: 0.1; }

    .premium-paginator { background: transparent !important; color: var(--text-on-light) !important; }
  `]
})
export class PatientsComponent implements OnInit {
  private directory = inject(DirectoryService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  
  patients = signal<Patient[]>([]);
  total = signal(0);
  loading = signal(true);
  displayedColumns = ['name', 'memberId', 'plan', 'dob', 'status', 'actions'];

  searchControl = new FormControl('');
  planFilter = new FormControl('');
  page = 1;
  pageSize = 10;

  constructor() {
    this.searchControl.valueChanges.pipe(debounceTime(300), takeUntilDestroyed()).subscribe(() => this.loadPatients());
    this.planFilter.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.loadPatients());
  }

  ngOnInit() { this.loadPatients(); }

  loadPatients() {
    this.loading.set(true);
    this.directory.getPatients().subscribe({
      next: (data) => {
        let filtered = data;
        if (this.searchControl.value) {
          const q = this.searchControl.value.toLowerCase();
          filtered = filtered.filter(p => `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) || p.memberId.toLowerCase().includes(q));
        }
        if (this.planFilter.value) {
          filtered = filtered.filter(p => p.insurancePlan?.planName?.includes(this.planFilter.value!));
        }
        this.patients.set(filtered);
        this.total.set(filtered.length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onPageChange(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadPatients();
  }

  addPatient() {
    const dialogRef = this.dialog.open(PatientFormDialogComponent, { width: '800px', disableClose: true });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.directory.addPatient(result).subscribe(() => {
          this.loadPatients();
          this.snackBar.open('New Member Enrolled Successfully', 'Success', { duration: 3000 });
        });
      }
    });
  }

  viewProfile(p: Patient) {
    this.dialog.open(PatientDetailDialogComponent, { width: '800px', data: p });
  }

  editPatient(p: Patient) {
    const dialogRef = this.dialog.open(PatientFormDialogComponent, { width: '800px', data: p, disableClose: true });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.directory.updatePatient(p.patientId, result).subscribe(() => {
          this.loadPatients();
          this.snackBar.open('Patient Records Synchronized', 'Success', { duration: 3000 });
        });
      }
    });
  }

  deletePatient(p: Patient) {
    if (confirm(`Are you sure you want to deactivate member ${p.firstName} ${p.lastName}?`)) {
      this.directory.deletePatient(p.patientId).subscribe(() => {
        this.loadPatients();
        this.snackBar.open('Member Deactivated', 'Warning', { duration: 3000 });
      });
    }
  }
}
