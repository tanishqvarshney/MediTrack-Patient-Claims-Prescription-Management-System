import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { DecimalPipe, DatePipe } from '@angular/common';
import { ClaimsService } from '../../../core/services/api.services';
import { ClaimDetail } from '../../../shared/models/models';

@Component({
  selector: 'app-claim-detail',
  standalone: true,
  imports: [
    RouterLink, MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule, MatDividerModule, MatProgressSpinnerModule,
    MatChipsModule, DecimalPipe, DatePipe
  ],
  template: `
    <div class="page-container">
      <a mat-button routerLink="/claims" class="back-btn">
        <mat-icon>arrow_back</mat-icon> Back to Claims
      </a>

      @if (loading()) {
        <div class="spinner-center"><mat-spinner></mat-spinner></div>
      }

      @if (claim(); as c) {
        <div class="detail-header">
          <div>
            <h1>{{ c.claimNumber }}</h1>
            <p class="meta">Submitted {{ c.submittedDate | date:'medium' }}</p>
          </div>
          <span class="status-badge" [class]="'status-' + c.status.toLowerCase()">
            {{ c.status }}
          </span>
        </div>

        <div class="info-grid">
          <!-- Patient Info -->
          <mat-card class="info-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>person</mat-icon>
              <mat-card-title>Patient</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="field"><span class="lbl">Name</span><span>{{ c.patientName }}</span></div>
              <div class="field"><span class="lbl">Service Date</span><span>{{ c.serviceDate | date:'longDate' }}</span></div>
            </mat-card-content>
          </mat-card>

          <!-- Provider Info -->
          <mat-card class="info-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>local_hospital</mat-icon>
              <mat-card-title>Provider</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="field"><span class="lbl">Name</span><span>{{ c.providerName }}</span></div>
              <div class="field"><span class="lbl">Processed</span>
                <span>{{ c.processedDate ? (c.processedDate | date:'medium') : 'Pending' }}</span>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Financial Summary -->
          <mat-card class="info-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>attach_money</mat-icon>
              <mat-card-title>Financial</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="field"><span class="lbl">Total Amount</span>
                <span class="amount">\${{ c.totalAmount | number:'1.2-2' }}</span>
              </div>
              @if (c.rejectionReason) {
                <div class="rejection-reason">
                  <mat-icon>warning</mat-icon>
                  {{ c.rejectionReason }}
                </div>
              }
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Line Items Table -->
        <mat-card class="line-items-card">
          <mat-card-header>
            <mat-card-title>Line Items</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="c.lineItems" class="full-width">
              <ng-container matColumnDef="procedureCode">
                <th mat-header-cell *matHeaderCellDef>CPT Code</th>
                <td mat-cell *matCellDef="let li"><code>{{ li.procedureCode }}</code></td>
              </ng-container>
              <ng-container matColumnDef="diagnosisCode">
                <th mat-header-cell *matHeaderCellDef>ICD-10</th>
                <td mat-cell *matCellDef="let li">{{ li.diagnosisCode || '—' }}</td>
              </ng-container>
              <ng-container matColumnDef="quantity">
                <th mat-header-cell *matHeaderCellDef>Qty</th>
                <td mat-cell *matCellDef="let li">{{ li.quantity }}</td>
              </ng-container>
              <ng-container matColumnDef="unitCost">
                <th mat-header-cell *matHeaderCellDef>Unit Cost</th>
                <td mat-cell *matCellDef="let li">\${{ li.unitCost | number:'1.2-2' }}</td>
              </ng-container>
              <ng-container matColumnDef="lineTotal">
                <th mat-header-cell *matHeaderCellDef>Line Total</th>
                <td mat-cell *matCellDef="let li" class="amount">\${{ li.lineTotal | number:'1.2-2' }}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="liColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: liColumns"></tr>
            </table>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1100px; margin: 0 auto; }
    .back-btn { margin-bottom: 16px; }
    .detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .meta { color: #888; margin: 4px 0 0; }
    .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .info-card { border-radius: 12px; }
    .field { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
    .lbl { color: #888; font-size: 13px; }
    .amount { font-weight: 700; font-size: 18px; color: #1976d2; }
    .line-items-card { border-radius: 12px; }
    .full-width { width: 100%; }
    .rejection-reason {
      display: flex; align-items: center; gap: 8px;
      color: #c62828; background: #ffebee; padding: 8px 12px; border-radius: 8px; margin-top: 8px;
    }
    .spinner-center { display: flex; justify-content: center; padding: 64px; }
    .status-badge { padding: 6px 16px; border-radius: 16px; font-size: 13px; font-weight: 600; }
    .status-pending  { background: #fff3e0; color: #e65100; }
    .status-processing { background: #e3f2fd; color: #1565c0; }
    .status-approved { background: #e8f5e9; color: #2e7d32; }
    .status-rejected { background: #ffebee; color: #c62828; }
    .status-paid     { background: #f3e5f5; color: #6a1b9a; }
  `]
})
export class ClaimDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private claimsService = inject(ClaimsService);

  claim = signal<ClaimDetail | null>(null);
  loading = signal(false);
  liColumns = ['procedureCode', 'diagnosisCode', 'quantity', 'unitCost', 'lineTotal'];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loading.set(true);
    this.claimsService.getClaim(id).subscribe({
      next: c => { this.claim.set(c); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
