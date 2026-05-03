import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/auth/auth.service';
import { PagedResult } from '../../../shared/models/models';
import { environment } from '../../../../environments/environment';

interface PrescriptionSummary {
  prescriptionId: string;
  drugName: string;
  drugCode: string;
  quantity: number;
  daysSupply: number;
  writtenDate: string;
  filledDate?: string;
  status: string;
}

@Component({
  selector: 'app-prescription-list',
  standalone: true,
  imports: [
    RouterLink, MatCardModule, MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatProgressBarModule, MatChipsModule, DatePipe
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Prescriptions</h1>
          <p class="subtitle">Your active and past prescriptions</p>
        </div>
        <a mat-raised-button color="primary" routerLink="/pharmacy">
          <mat-icon>search</mat-icon> Drug Lookup
        </a>
      </div>

      @if (loading()) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }

      <mat-card class="table-card">
        <table mat-table [dataSource]="prescriptions()" class="rx-table">

          <ng-container matColumnDef="drugName">
            <th mat-header-cell *matHeaderCellDef>Drug</th>
            <td mat-cell *matCellDef="let rx">
              <div class="drug-name">{{ rx.drugName }}</div>
              <div class="ndc-code">NDC: {{ rx.drugCode }}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="quantity">
            <th mat-header-cell *matHeaderCellDef>Qty / Supply</th>
            <td mat-cell *matCellDef="let rx">
              {{ rx.quantity }} units / {{ rx.daysSupply }} days
            </td>
          </ng-container>

          <ng-container matColumnDef="writtenDate">
            <th mat-header-cell *matHeaderCellDef>Written</th>
            <td mat-cell *matCellDef="let rx">{{ rx.writtenDate | date:'mediumDate' }}</td>
          </ng-container>

          <ng-container matColumnDef="filledDate">
            <th mat-header-cell *matHeaderCellDef>Filled</th>
            <td mat-cell *matCellDef="let rx">
              {{ rx.filledDate ? (rx.filledDate | date:'mediumDate') : '—' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let rx">
              <span class="status-badge" [class]="'rx-' + rx.status.toLowerCase()">
                {{ rx.status }}
              </span>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns" class="rx-row"></tr>

          <tr class="mat-row no-data" *matNoDataRow>
            <td [attr.colspan]="columns.length">
              <mat-icon>medication_liquid</mat-icon>
              <p>No prescriptions on file</p>
            </td>
          </tr>
        </table>

        <mat-paginator
          [length]="total()"
          [pageSize]="pageSize"
          [pageSizeOptions]="[10, 20, 50]"
          (page)="onPageChange($event)">
        </mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1100px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .subtitle { color: #666; margin: 4px 0 0; }
    .table-card { border-radius: 12px; overflow: hidden; }
    .rx-table { width: 100%; }
    .drug-name { font-weight: 600; }
    .ndc-code { font-size: 11px; color: #888; font-family: monospace; }
    .rx-row:hover { background: #f5f7fa; }
    .status-badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .rx-pending  { background: #fff3e0; color: #e65100; }
    .rx-approved { background: #e8f5e9; color: #2e7d32; }
    .rx-filled   { background: #e3f2fd; color: #1565c0; }
    .rx-denied   { background: #ffebee; color: #c62828; }
    .rx-cancelled { background: #f5f5f5; color: #616161; }
    .rx-pendingauth { background: #f3e5f5; color: #6a1b9a; }
    .no-data td { text-align: center; padding: 48px; color: #999; }
    .no-data mat-icon { font-size: 48px; display: block; margin-bottom: 8px; }
  `]
})
export class PrescriptionListComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  columns = ['drugName', 'quantity', 'writtenDate', 'filledDate', 'status'];
  prescriptions = signal<PrescriptionSummary[]>([]);
  total = signal(0);
  loading = signal(false);
  page = 1;
  pageSize = 20;

  ngOnInit() { this.loadPrescriptions(); }

  loadPrescriptions() {
    this.loading.set(true);
    const patientId = this.auth.currentUser()?.userId;
    const url = `${environment.apiUrl}/pharmacy/prescriptions/${patientId}?page=${this.page}&pageSize=${this.pageSize}`;

    this.http.get<PagedResult<PrescriptionSummary>>(url).subscribe({
      next: r => { this.prescriptions.set(r.items); this.total.set(r.total); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onPageChange(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadPrescriptions();
  }
}
