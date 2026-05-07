import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClaimsService } from '../../../core/services/api.services';
import { ClaimDetail, ClaimStatus } from '../../../shared/models/models';

@Component({
  selector: 'app-claim-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatButtonModule, MatIconModule, MatDividerModule,
    MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="header-actions">
        <a mat-button routerLink="/claims" class="back-link">
          <mat-icon>arrow_back</mat-icon> Back to Claims
        </a>
      </div>

      @if (loading()) {
        <div class="loader-container">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Orchestrating clinical records...</p>
        </div>
      } @else {
        @if (claim(); as c) {
          <div class="frosted-card fade-in">
          <div class="detail-header">
            <div class="title-group">
              <span class="meta">Claim Reference</span>
              <h1>{{ c.claimNumber }}</h1>
              <p class="meta">Submitted {{ c.submittedDate | date:'medium' }}</p>
            </div>
            <span class="status-badge" [class]="'status-' + c.status.toLowerCase()">
              {{ c.status }}
            </span>
          </div>

          @if (c.status.toLowerCase() === 'pending') {
            <div class="adjudication-bar slide-up">
              <div class="adj-info">
                <div class="pulse-icon"></div>
                <div class="adj-text">
                  <span class="adj-title">Clinical Adjudication Required</span>
                  <span class="adj-subtitle">Status: {{ c.status }} | Awaiting Review</span>
                </div>
              </div>
              <div class="adj-actions">
                <button mat-stroked-button class="reject-btn" (click)="updateStatus('Rejected')">
                  <mat-icon>block</mat-icon> Reject Claim
                </button>
                <button mat-raised-button class="approve-btn" (click)="updateStatus('Approved')">
                  <mat-icon>check_circle</mat-icon> Approve Claim
                </button>
              </div>
            </div>
          } @else {
            <div class="status-telemetry-bar fade-in">
              <mat-icon>info</mat-icon>
              <span>This claim has been processed. Current Lifecycle State: <strong>{{ c.status }}</strong></span>
            </div>
          }

          <div class="info-grid">
            <div class="glass-card detail-section">
              <div class="section-head">
                <mat-icon>person</mat-icon>
                <h3>Patient</h3>
              </div>
              <div class="data-row">
                <span class="label">Name</span>
                <span class="value">{{ c.patientName }}</span>
              </div>
              <div class="data-row">
                <span class="label">Service Date</span>
                <span class="value">{{ c.serviceDate | date }}</span>
              </div>
            </div>

            <div class="glass-card detail-section">
              <div class="section-head">
                <mat-icon>medical_services</mat-icon>
                <h3>Provider</h3>
              </div>
              <div class="data-row">
                <span class="label">Name</span>
                <span class="value">{{ c.providerName }}</span>
              </div>
              <div class="data-row">
                <span class="label">Processed</span>
                <span class="value">{{ c.status }}</span>
              </div>
            </div>

            <div class="glass-card detail-section">
              <div class="section-head">
                <mat-icon>payments</mat-icon>
                <h3>Financial</h3>
              </div>
              <div class="data-row">
                <span class="label">Total Amount</span>
                <span class="value amount">{{ c.totalAmount | currency }}</span>
              </div>
            </div>
          </div>

          <div class="line-items-section">
            <h3>Line Items</h3>
            <div class="items-table-container">
              <table class="items-table">
                <thead>
                  <tr>
                    <th>CPT Code</th>
                    <th>ICD-10</th>
                    <th>Qty</th>
                    <th>Unit Cost</th>
                    <th>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of c.lineItems; track item.procedureCode) {
                    <tr>
                      <td>{{ item.procedureCode }}</td>
                      <td>{{ item.diagnosisCode || '—' }}</td>
                      <td>{{ item.quantity }}</td>
                      <td>{{ item.unitCost | currency }}</td>
                      <td class="row-total">{{ item.lineTotal | currency }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
        }
      }
    </div>
  `,
  styles: [`
    .page-container { max-width: 1100px; margin: 0 auto; }
    .header-actions { margin-bottom: 24px; }
    .back-link { color: var(--text-muted) !important; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; }
    .back-link:hover { color: var(--text-main) !important; }

    .loader-container { 
      height: 400px; display: flex; flex-direction: column; 
      align-items: center; justify-content: center; gap: 16px;
      color: var(--text-muted);
    }

    .frosted-card {
      background: #ffffff;
      border-radius: 28px;
      border: 1px solid #e2e8f0;
      padding: 40px;
      box-shadow: var(--shadow-lg);
      color: var(--text-main);
    }

    .detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
    .title-group h1 { font-size: 32px; font-weight: 800; color: var(--text-main); margin: 0; letter-spacing: -1px; }
    .meta { color: var(--text-muted); font-size: 14px; margin-top: 4px; font-weight: 500; }

    .status-badge {
      padding: 8px 16px; border-radius: 9999px; font-size: 12px; font-weight: 800;
      letter-spacing: 1px; text-transform: uppercase;
    }
    .status-pending   { background: #fef3c7; color: #92400e; }
    .status-approved  { background: #dcfce7; color: #166534; }
    .status-rejected  { background: #fee2e2; color: #991b1b; }
    .status-paid      { background: #f3e8ff; color: #6b21a8; }

    .adjudication-bar {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 20px; padding: 24px 32px; margin-bottom: 40px;
      display: flex; justify-content: space-between; align-items: center;
      box-shadow: 0 4px 20px rgba(37, 99, 235, 0.05);
    }
    .adj-info { display: flex; align-items: center; gap: 20px; }
    .pulse-icon { width: 12px; height: 12px; background: var(--primary); border-radius: 50%; animation: pulse 2s infinite; }
    @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(37, 99, 235, 0); } 100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); } }
    
    .adj-text { display: flex; flex-direction: column; }
    .adj-title { font-size: 18px; font-weight: 800; color: var(--text-main); letter-spacing: -0.3px; }
    .adj-subtitle { font-size: 13px; color: var(--text-muted); font-weight: 600; margin-top: 2px; }

    .adj-actions { display: flex; gap: 16px; }
    .adj-actions button { border-radius: 14px !important; font-weight: 800; height: 48px; padding: 0 24px; transition: var(--transition); }
    
    .reject-btn { border-color: #fecaca !important; color: var(--error) !important; background: #fff !important; }
    .reject-btn:hover { background: #fee2e2 !important; border-color: var(--error) !important; }
    
    .approve-btn { background: var(--primary) !important; color: #fff !important; box-shadow: 0 8px 16px rgba(37, 99, 235, 0.2) !important; }
    .approve-btn:hover { background: var(--primary-hover) !important; transform: translateY(-2px); box-shadow: 0 12px 24px rgba(37, 99, 235, 0.3) !important; }

    .status-telemetry-bar {
      background: #f8fafc; border: 1px solid #e2e8f0;
      border-radius: 16px; padding: 16px 24px; margin-bottom: 32px;
      display: flex; align-items: center; gap: 12px; color: var(--text-muted); font-size: 14px;
    }
    .status-telemetry-bar mat-icon { font-size: 20px; width: 20px; height: 20px; opacity: 0.5; }
    .status-telemetry-bar strong { color: var(--text-main); margin-left: 4px; }

    .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 40px; }
    .detail-section { padding: 24px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; }
    .section-head { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; color: var(--primary); }
    .section-head mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .section-head h3 { margin: 0; font-size: 16px; font-weight: 700; color: var(--text-main); }
    
    .data-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
    .data-row:last-child { margin-bottom: 0; }
    .label { font-size: 13px; color: var(--text-muted); font-weight: 500; }
    .value { font-size: 14px; font-weight: 600; color: var(--text-main); }
    .amount { color: var(--primary); font-size: 18px; font-weight: 800; }

    .line-items-section h3 { font-size: 20px; font-weight: 800; margin-bottom: 24px; }
    .items-table-container { background: #f8fafc; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; }
    .items-table { width: 100%; border-collapse: collapse; }
    .items-table th { padding: 16px 24px; text-align: left; font-size: 12px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #e2e8f0; }
    .items-table td { padding: 16px 24px; font-size: 14px; color: var(--text-main); border-bottom: 1px solid #f1f5f9; }
    .items-table tr:last-child td { border-bottom: none; }
    .row-total { font-weight: 700; color: var(--primary); }
  `]
})
export class ClaimDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private claimsService = inject(ClaimsService);
  private snackBar = inject(MatSnackBar);

  claim = signal<ClaimDetail | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loading.set(true);
    this.claimsService.getClaim(id).subscribe({
      next: c => {
        this.claim.set(c);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  updateStatus(status: ClaimStatus) {
    if (!this.claim()) return;
    
    this.claimsService.updateClaimStatus(this.claim()!.claimId, status).subscribe({
      next: () => {
        this.snackBar.open(`Claim successfully ${status}`, 'Close', { duration: 3000 });
        this.refresh();
      }
    });
  }
}
