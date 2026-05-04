import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ClaimsService } from '../../../core/services/api.services';
import { ClaimStatus, ClaimSummary } from '../../../shared/models/models';

@Component({
  selector: 'app-claims-list',
  standalone: true,
  imports: [
    RouterLink, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatSelectModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatProgressBarModule, DecimalPipe, DatePipe
  ],
  template: `
    <div class="page-container fade-in">
      <div class="page-header">
        <div class="header-text">
          <h1>Claims Management</h1>
          <p class="subtitle">Real-time overview of all healthcare transactions</p>
        </div>
        <a mat-raised-button color="primary" routerLink="/claims/submit" class="submit-btn">
          <mat-icon>add</mat-icon> <span>New Claim</span>
        </a>
      </div>

      <!-- Stats Bar (Optional but FAANG-like) -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon pending"><mat-icon>pending_actions</mat-icon></div>
          <div class="stat-info">
            <span class="stat-label">Pending Review</span>
            <span class="stat-value">12</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon approved"><mat-icon>check_circle</mat-icon></div>
          <div class="stat-info">
            <span class="stat-label">Processed Today</span>
            <span class="stat-value">48</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon paid"><mat-icon>payments</mat-icon></div>
          <div class="stat-info">
            <span class="stat-label">Total Paid Out</span>
            <span class="stat-value">$14,250.00</span>
          </div>
        </div>
      </div>

      <div class="table-wrapper mat-elevation-z2">
        <div class="table-header">
          <div class="search-box">
            <mat-icon>search</mat-icon>
            <input type="text" placeholder="Search by patient or ID..." [formControl]="statusFilter">
          </div>
          
          <mat-form-field appearance="outline" class="status-select">
            <mat-label>Filter Status</mat-label>
            <mat-select [formControl]="statusFilter">
              <mat-option value="">All Statuses</mat-option>
              <mat-option value="Pending">Pending</mat-option>
              <mat-option value="Processing">Processing</mat-option>
              <mat-option value="Approved">Approved</mat-option>
              <mat-option value="Rejected">Rejected</mat-option>
              <mat-option value="Paid">Paid</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        @if (loading()) {
          <mat-progress-bar mode="indeterminate" class="loading-bar"></mat-progress-bar>
        }

        <div class="table-scroll">
          <table mat-table [dataSource]="claims()" class="claims-table">
            <ng-container matColumnDef="claimNumber">
              <th mat-header-cell *matHeaderCellDef>Claim Reference</th>
              <td mat-cell *matCellDef="let c">
                <div class="claim-ref">
                  <span class="ref-id">{{ c.claimNumber }}</span>
                  <span class="ref-date">{{ c.serviceDate | date:'mediumDate' }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="patientName">
              <th mat-header-cell *matHeaderCellDef>Patient Name</th>
              <td mat-cell *matCellDef="let c">
                <div class="patient-info">
                  <div class="patient-avatar">{{ c.patientName[0] }}</div>
                  <span>{{ c.patientName }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="serviceDate">
              <th mat-header-cell *matHeaderCellDef>Date of Service</th>
              <td mat-cell *matCellDef="let c">{{ c.serviceDate | date:'MMM d, yyyy' }}</td>
            </ng-container>

            <ng-container matColumnDef="totalAmount">
              <th mat-header-cell *matHeaderCellDef>Total Amount</th>
              <td mat-cell *matCellDef="let c" class="amount-cell">\${{ c.totalAmount | number:'1.2-2' }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Processing Status</th>
              <td mat-cell *matCellDef="let c">
                <div class="status-pill" [class]="'pill-' + c.status.toLowerCase()">
                  <span class="dot"></span>
                  {{ c.status }}
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let c" class="action-cell">
                <button mat-icon-button [routerLink]="['/claims', c.claimId]" class="view-btn">
                  <mat-icon>arrow_forward_ios</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;" class="claim-row" [routerLink]="['/claims', row.claimId]"></tr>

            <tr class="no-data-row" *matNoDataRow>
              <td [attr.colspan]="columns.length">
                <div class="empty-state">
                  <mat-icon>search_off</mat-icon>
                  <h3>No matching records</h3>
                  <p>Try adjusting your filters or searching for something else.</p>
                </div>
              </td>
            </tr>
          </table>
        </div>

        <mat-paginator
          class="premium-paginator"
          [length]="total()"
          [pageSize]="pageSize"
          [pageSizeOptions]="[10, 20, 50]"
          (page)="onPageChange($event)"
          showFirstLastButtons>
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
    h1 { font-size: 32px; margin: 0; letter-spacing: -0.5px; }
    .subtitle { color: var(--text-muted); margin: 4px 0 0; font-size: 15px; font-weight: 500; }
    .submit-btn { height: 48px !important; border-radius: 12px !important; padding: 0 24px !important; }

    /* Stats Bar */
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-bottom: 32px; }
    .stat-card {
      background: #fff; padding: 20px; border-radius: 16px; border: 1px solid #f1f5f9;
      display: flex; align-items: center; gap: 16px; box-shadow: var(--shadow-sm);
    }
    .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .stat-icon mat-icon { font-size: 24px; }
    .stat-icon.pending { background: #fff7ed; color: #f97316; }
    .stat-icon.approved { background: #f0fdf4; color: #22c55e; }
    .stat-icon.paid { background: #eff6ff; color: #3b82f6; }
    .stat-label { font-size: 13px; color: var(--text-muted); font-weight: 600; display: block; }
    .stat-value { font-size: 24px; font-weight: 700; color: var(--text-main); font-family: 'Outfit'; }

    /* Table Wrapper */
    .table-wrapper { background: #fff; border-radius: 20px; overflow: hidden; border: 1px solid #f1f5f9; }
    .table-header { padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; gap: 24px; }
    .search-box {
      flex: 1; display: flex; align-items: center; gap: 12px;
      background: #f8fafc; padding: 10px 16px; border-radius: 12px; border: 1px solid #e2e8f0;
    }
    .search-box mat-icon { color: #94a3b8; font-size: 20px; width: 20px; height: 20px; }
    .search-box input { border: none; background: transparent; outline: none; flex: 1; font-size: 14px; font-weight: 500; }
    .status-select { width: 180px; }
    
    .loading-bar { height: 3px; margin-top: -1px; }
    
    /* Table Styling */
    .table-scroll { overflow-x: auto; }
    .claims-table { width: 100%; border-collapse: separate; border-spacing: 0; }
    
    .mat-mdc-header-cell {
      padding: 16px 24px !important;
      background: #f8fafc !important;
      color: #64748b !important;
      font-size: 11px !important;
      font-weight: 700 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.8px !important;
      border-bottom: 1px solid #f1f5f9 !important;
    }

    .mat-mdc-cell { padding: 16px 24px !important; border-bottom: 1px solid #f8fafc !important; }
    .claim-row { transition: var(--transition); cursor: pointer; }
    .claim-row:hover { background: #f8fafc !important; }

    .claim-ref { display: flex; flex-direction: column; }
    .ref-id { font-weight: 700; color: var(--text-main); font-family: 'Outfit'; font-size: 15px; }
    .ref-date { font-size: 12px; color: var(--text-muted); font-weight: 500; }

    .patient-info { display: flex; align-items: center; gap: 12px; font-weight: 600; color: var(--text-main); }
    .patient-avatar {
      width: 32px; height: 32px; border-radius: 10px; background: #f1f5f9; color: var(--primary);
      display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800;
    }

    .amount-cell { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 16px; color: var(--text-main); }

    /* Status Pills */
    .status-pill {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 6px 14px; border-radius: 12px; font-size: 13px; font-weight: 700;
    }
    .dot { width: 6px; height: 6px; border-radius: 50%; }
    
    .pill-pending { background: #fff7ed; color: #c2410c; }
    .pill-pending .dot { background: #f97316; }
    
    .pill-processing { background: #eff6ff; color: #1d4ed8; }
    .pill-processing .dot { background: #3b82f6; }
    
    .pill-approved { background: #f0fdf4; color: #15803d; }
    .pill-approved .dot { background: #22c55e; }
    
    .pill-rejected { background: #fef2f2; color: #b91c1c; }
    .pill-rejected .dot { background: #ef4444; }

    .pill-paid { background: #f5f3ff; color: #6d28d9; }
    .pill-paid .dot { background: #8b5cf6; }

    .action-cell { width: 48px; text-align: right; }
    .view-btn { color: #cbd5e1; }
    .claim-row:hover .view-btn { color: var(--primary); transform: translateX(2px); }

    .empty-state { text-align: center; padding: 64px 24px; color: var(--text-light); }
    .empty-state mat-icon { font-size: 56px; width: 56px; height: 56px; margin-bottom: 16px; color: #e2e8f0; }
    .empty-state h3 { margin: 0; color: var(--text-muted); font-size: 18px; }

    .premium-paginator { border-top: 1px solid #f1f5f9; }
  `]
})
export class ClaimsListComponent implements OnInit {
  private claimsService = inject(ClaimsService);

  columns = ['claimNumber', 'patientName', 'serviceDate', 'totalAmount', 'status', 'actions'];
  claims = signal<ClaimSummary[]>([]);
  total = signal(0);
  loading = signal(false);
  page = 1;
  pageSize = 20;

  statusFilter = new FormControl('');

  constructor() {
    this.statusFilter.valueChanges.pipe(
      debounceTime(300),
      takeUntilDestroyed()
    ).subscribe(() => {
      this.page = 1;
      this.loadClaims();
    });
  }

  ngOnInit() { this.loadClaims(); }

  loadClaims() {
    this.loading.set(true);
    this.claimsService.getClaims({
      page: this.page,
      pageSize: this.pageSize,
      status: this.statusFilter.value || undefined
    }).subscribe({
      next: result => {
        this.claims.set(result.items);
        this.total.set(result.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onPageChange(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadClaims();
  }
}
