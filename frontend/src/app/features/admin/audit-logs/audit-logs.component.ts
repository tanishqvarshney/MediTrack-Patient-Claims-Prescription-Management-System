import { Component, inject, signal, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatePipe, SlicePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuditLog, PagedResult } from '../../../shared/models/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatCardModule, MatTableModule, MatPaginatorModule,
    MatFormFieldModule, MatSelectModule, MatIconModule, MatChipsModule,
    MatProgressBarModule, MatTooltipModule, DatePipe, SlicePipe
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Audit Logs</h1>
          <p class="subtitle">HIPAA-inspired compliance trail — all data access and mutations</p>
        </div>
      </div>

      <div class="filter-row">
        <mat-form-field appearance="outline" class="entity-filter">
          <mat-label>Entity Type</mat-label>
          <mat-select [formControl]="entityFilter">
            <mat-option value="">All</mat-option>
            <mat-option value="Claim">Claim</mat-option>
            <mat-option value="Prescription">Prescription</mat-option>
            <mat-option value="Patient">Patient</mat-option>
            <mat-option value="User">User</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      @if (loading()) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }

      <mat-card class="table-card">
        <table mat-table [dataSource]="logs()" class="audit-table">

          <ng-container matColumnDef="timestamp">
            <th mat-header-cell *matHeaderCellDef>Timestamp (UTC)</th>
            <td mat-cell *matCellDef="let l" class="mono">{{ l.timestamp | date:'yyyy-MM-dd HH:mm:ss' : 'UTC' }}</td>
          </ng-container>

          <ng-container matColumnDef="entityType">
            <th mat-header-cell *matHeaderCellDef>Entity</th>
            <td mat-cell *matCellDef="let l">
              <span class="entity-badge" [class]="'entity-' + l.entityType.toLowerCase()">
                {{ l.entityType }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="entityId">
            <th mat-header-cell *matHeaderCellDef>Entity ID</th>
            <td mat-cell *matCellDef="let l" class="mono truncate"
              [matTooltip]="l.entityId">{{ l.entityId | slice:0:16 }}…</td>
          </ng-container>

          <ng-container matColumnDef="action">
            <th mat-header-cell *matHeaderCellDef>Action</th>
            <td mat-cell *matCellDef="let l">
              <span class="action-badge" [class]="'action-' + l.action.toLowerCase()">
                {{ l.action }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="userId">
            <th mat-header-cell *matHeaderCellDef>User</th>
            <td mat-cell *matCellDef="let l" class="mono truncate">{{ l.userId | slice:0:12 }}…</td>
          </ng-container>

          <ng-container matColumnDef="userRole">
            <th mat-header-cell *matHeaderCellDef>Role</th>
            <td mat-cell *matCellDef="let l">{{ l.userRole }}</td>
          </ng-container>

          <ng-container matColumnDef="ipAddress">
            <th mat-header-cell *matHeaderCellDef>IP Address</th>
            <td mat-cell *matCellDef="let l" class="mono">{{ l.ipAddress || '—' }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns; sticky: true"></tr>
          <tr mat-row *matRowDef="let row; columns: columns" class="log-row"></tr>

          <tr class="mat-row no-data" *matNoDataRow>
            <td [attr.colspan]="columns.length">No audit records found</td>
          </tr>
        </table>

        <mat-paginator
          [length]="total()"
          [pageSize]="pageSize"
          [pageSizeOptions]="[20, 50, 100]"
          (page)="onPageChange($event)"
          showFirstLastButtons>
        </mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1300px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .subtitle { color: #666; margin: 4px 0 0; font-size: 13px; }
    .filter-row { margin-bottom: 16px; }
    .entity-filter { width: 200px; }
    .table-card { border-radius: 12px; overflow: auto; }
    .audit-table { width: 100%; min-width: 900px; }
    .mono { font-family: 'Courier New', monospace; font-size: 12px; }
    .truncate { max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .log-row:hover { background: #f5f7fa; }
    .entity-badge, .action-badge {
      padding: 2px 10px; border-radius: 10px; font-size: 11px; font-weight: 600;
    }
    .entity-claim    { background: #e3f2fd; color: #1565c0; }
    .entity-patient  { background: #e8f5e9; color: #2e7d32; }
    .entity-user     { background: #f3e5f5; color: #6a1b9a; }
    .entity-prescription { background: #fff3e0; color: #e65100; }
    .action-added    { background: #e8f5e9; color: #2e7d32; }
    .action-modified { background: #fff3e0; color: #e65100; }
    .action-deleted  { background: #ffebee; color: #c62828; }
    .no-data td { text-align: center; padding: 48px; color: #999; }
  `]
})
export class AuditLogsComponent implements OnInit {
  private http = inject(HttpClient);

  columns = ['timestamp', 'entityType', 'entityId', 'action', 'userId', 'userRole', 'ipAddress'];
  logs = signal<AuditLog[]>([]);
  total = signal(0);
  loading = signal(false);
  page = 1;
  pageSize = 20;

  entityFilter = new FormControl('');

  constructor() {
    this.entityFilter.valueChanges.pipe(
      debounceTime(300),
      takeUntilDestroyed()
    ).subscribe(() => { this.page = 1; this.loadLogs(); });
  }

  ngOnInit() { this.loadLogs(); }

  loadLogs() {
    this.loading.set(true);
    let url = `${environment.apiUrl}/admin/audit-logs?page=${this.page}&pageSize=${this.pageSize}`;
    if (this.entityFilter.value) url += `&entityType=${this.entityFilter.value}`;

    this.http.get<PagedResult<AuditLog>>(url).subscribe({
      next: r => { this.logs.set(r.items); this.total.set(r.total); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onPageChange(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadLogs();
  }
}
