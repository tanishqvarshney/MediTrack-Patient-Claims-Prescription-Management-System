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
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Claims</h1>
          <p class="subtitle">View and manage submitted claims</p>
        </div>
        <a mat-raised-button color="primary" routerLink="/claims/submit">
          <mat-icon>add</mat-icon> Submit Claim
        </a>
      </div>

      <!-- Filters -->
      <div class="filter-row">
        <mat-form-field appearance="outline" class="status-filter">
          <mat-label>Status</mat-label>
          <mat-select [formControl]="statusFilter">
            <mat-option value="">All</mat-option>
            <mat-option value="Pending">Pending</mat-option>
            <mat-option value="Processing">Processing</mat-option>
            <mat-option value="Approved">Approved</mat-option>
            <mat-option value="Rejected">Rejected</mat-option>
            <mat-option value="Paid">Paid</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      @if (loading()) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }

      <!-- Table -->
      <div class="table-card">
        <table mat-table [dataSource]="claims()" class="claims-table">
          <ng-container matColumnDef="claimNumber">
            <th mat-header-cell *matHeaderCellDef>Claim #</th>
            <td mat-cell *matCellDef="let c">
              <a [routerLink]="['/claims', c.claimId]" class="claim-link">{{ c.claimNumber }}</a>
            </td>
          </ng-container>

          <ng-container matColumnDef="patientName">
            <th mat-header-cell *matHeaderCellDef>Patient</th>
            <td mat-cell *matCellDef="let c">{{ c.patientName }}</td>
          </ng-container>

          <ng-container matColumnDef="serviceDate">
            <th mat-header-cell *matHeaderCellDef>Service Date</th>
            <td mat-cell *matCellDef="let c">{{ c.serviceDate | date:'mediumDate' }}</td>
          </ng-container>

          <ng-container matColumnDef="totalAmount">
            <th mat-header-cell *matHeaderCellDef>Amount</th>
            <td mat-cell *matCellDef="let c" class="amount">\${{ c.totalAmount | number:'1.2-2' }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let c">
              <span class="status-badge" [class]="'status-' + c.status.toLowerCase()">
                {{ c.status }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let c">
              <a mat-icon-button [routerLink]="['/claims', c.claimId]" color="primary">
                <mat-icon>chevron_right</mat-icon>
              </a>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;" class="table-row"></tr>

          <tr class="mat-row no-data" *matNoDataRow>
            <td [attr.colspan]="columns.length">
              <mat-icon>inbox</mat-icon>
              <p>No claims found</p>
            </td>
          </tr>
        </table>

        <mat-paginator
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
    .page-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .subtitle { color: #666; margin: 4px 0 0; }
    .filter-row { margin-bottom: 16px; }
    .status-filter { width: 200px; }
    .table-card { border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
    .claims-table { width: 100%; }
    .claim-link { color: #1976d2; text-decoration: none; font-weight: 500; }
    .claim-link:hover { text-decoration: underline; }
    .amount { font-weight: 600; font-family: monospace; }
    .table-row:hover { background: #f5f7fa; cursor: pointer; }
    .status-badge {
      padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;
    }
    .status-pending  { background: #fff3e0; color: #e65100; }
    .status-processing { background: #e3f2fd; color: #1565c0; }
    .status-approved { background: #e8f5e9; color: #2e7d32; }
    .status-rejected { background: #ffebee; color: #c62828; }
    .status-paid     { background: #f3e5f5; color: #6a1b9a; }
    .no-data td { text-align: center; padding: 48px; color: #999; }
    .no-data mat-icon { font-size: 48px; display: block; margin-bottom: 8px; }
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
