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
import { of, delay } from 'rxjs';
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
    <div class="page-container fade-in">
      <div class="page-header">
        <div class="header-text">
          <h1>Clinical Prescriptions</h1>
          <p class="subtitle">Secure history of pharmacological orchestration</p>
        </div>
        <a mat-raised-button color="primary" routerLink="/pharmacy" class="lookup-btn">
          <mat-icon>search</mat-icon> <span>Drug Lookup</span>
        </a>
      </div>

      @if (loading()) {
        <mat-progress-bar mode="indeterminate" class="loading-bar"></mat-progress-bar>
      }

      <div class="table-wrapper mat-elevation-z2">
        <table mat-table [dataSource]="prescriptions()" class="rx-table">

          <ng-container matColumnDef="drugName">
            <th mat-header-cell *matHeaderCellDef>Drug Information</th>
            <td mat-cell *matCellDef="let rx">
              <div class="drug-info">
                <span class="drug-name">{{ rx.drugName }}</span>
                <span class="drug-code">NDC: {{ rx.drugCode }}</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="quantity">
            <th mat-header-cell *matHeaderCellDef>Dispense / Supply</th>
            <td mat-cell *matCellDef="let rx">
              <div class="dispense-info">
                <strong>{{ rx.quantity }}</strong> units
                <span class="supply">/ {{ rx.daysSupply }}-day supply</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="writtenDate">
            <th mat-header-cell *matHeaderCellDef>Written Date</th>
            <td mat-cell *matCellDef="let rx">{{ rx.writtenDate | date:'MMM d, yyyy' }}</td>
          </ng-container>

          <ng-container matColumnDef="filledDate">
            <th mat-header-cell *matHeaderCellDef>Last Filled</th>
            <td mat-cell *matCellDef="let rx">
              <span class="fill-date">{{ rx.filledDate ? (rx.filledDate | date:'MMM d, yyyy') : 'Pending Fulfillment' }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let rx">
              <div class="status-badge" [class]="'rx-' + rx.status.toLowerCase()">
                <span class="dot"></span>
                {{ rx.status }}
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns" class="rx-row"></tr>

          <tr class="no-data-row" *matNoDataRow>
            <td [attr.colspan]="columns.length">
              <div class="empty-state">
                <mat-icon>medication_liquid</mat-icon>
                <h3>No prescriptions found</h3>
                <p>No active pharmacological records found for this patient.</p>
              </div>
            </td>
          </tr>
        </table>

        <mat-paginator
          class="premium-paginator"
          [length]="total()"
          [pageSize]="pageSize"
          [pageSizeOptions]="[10, 20, 50]"
          (page)="onPageChange($event)">
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 32px; max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
    h1 { font-family: 'Outfit', sans-serif; font-size: 32px; font-weight: 800; margin: 0; }
    .subtitle { color: var(--text-on-dark-muted); margin: 4px 0 0; font-size: 15px; font-weight: 500; }
    .lookup-btn { height: 48px !important; border-radius: 12px !important; padding: 0 24px !important; }

    /* Table Wrapper */
    .table-wrapper { 
      background: var(--bg-card-light); border-radius: 20px; overflow: hidden; 
      border: 1px solid rgba(255,255,255,0.4); backdrop-filter: blur(20px);
      box-shadow: var(--shadow-lg);
    }
    
    .loading-bar { height: 3px; }
    
    .rx-table { width: 100%; border-collapse: separate; border-spacing: 0; background: transparent !important; }
    
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

    .rx-row { transition: var(--transition); }
    .rx-row:hover { background: rgba(15, 23, 42, 0.02) !important; }

    .drug-info { display: flex; flex-direction: column; gap: 2px; }
    .drug-name { font-weight: 700; color: var(--text-on-light); font-size: 15px; }
    .drug-code { font-size: 11px; color: var(--text-on-light-muted); font-family: 'Outfit'; }

    .dispense-info { color: var(--text-on-light); }
    .supply { color: var(--text-on-light-muted); font-size: 13px; }

    .fill-date { font-weight: 500; color: var(--text-on-light); }

    /* Status Badges */
    .status-badge {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 6px 14px; border-radius: 12px; font-size: 12px; font-weight: 700;
    }
    .dot { width: 6px; height: 6px; border-radius: 50%; }

    .rx-pending { background: #fff7ed; color: #c2410c; }
    .rx-pending .dot { background: #f97316; }
    
    .rx-approved { background: #f0fdf4; color: #15803d; }
    .rx-approved .dot { background: #22c55e; }
    
    .rx-filled { background: #eff6ff; color: #1d4ed8; }
    .rx-filled .dot { background: #3b82f6; }
    
    .rx-denied { background: #fef2f2; color: #b91c1c; }
    .rx-denied .dot { background: #ef4444; }

    .rx-cancelled { background: #f1f5f9; color: #475569; }
    .rx-cancelled .dot { background: #94a3b8; }

    .empty-state { text-align: center; padding: 64px 24px; color: var(--text-on-light-light); }
    .empty-state mat-icon { font-size: 56px; width: 56px; height: 56px; margin-bottom: 16px; color: rgba(15, 23, 42, 0.05); }
    .empty-state h3 { margin: 0; color: var(--text-on-light-muted); font-size: 18px; }

    .premium-paginator { 
      border-top: 1px solid rgba(15, 23, 42, 0.05); 
      background: transparent !important; 
      color: var(--text-on-light) !important; 
    }
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

  private mockRxs: PrescriptionSummary[] = [
    { prescriptionId: 'rx1', drugName: 'Amoxicillin 500mg', drugCode: '0001-01', quantity: 30, daysSupply: 10, writtenDate: '2023-11-01', status: 'Filled', filledDate: '2023-11-02' },
    { prescriptionId: 'rx2', drugName: 'Lisinopril 10mg', drugCode: '0002-02', quantity: 90, daysSupply: 90, writtenDate: '2023-11-05', status: 'Approved' },
    { prescriptionId: 'rx3', drugName: 'Advair Diskus', drugCode: '0003-03', quantity: 1, daysSupply: 30, writtenDate: '2023-11-10', status: 'Pending' }
  ];

  ngOnInit() { this.loadPrescriptions(); }

  loadPrescriptions() {
    this.loading.set(true);
    // Simulating API call
    of({ items: this.mockRxs, total: this.mockRxs.length, page: 1, pageSize: 20 }).pipe(delay(800)).subscribe({
      next: (r) => { this.prescriptions.set(r.items); this.total.set(r.total); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onPageChange(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadPrescriptions();
  }
}
