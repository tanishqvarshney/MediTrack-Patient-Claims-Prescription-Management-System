import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DecimalPipe, PercentPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { AdminService } from '../../../core/services/api.services';
import { ClaimMetrics } from '../../../shared/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatCardModule, MatIconModule, MatButtonModule,
    MatProgressSpinnerModule, MatSelectModule, MatFormFieldModule,
    DecimalPipe, PercentPipe, BaseChartDirective
  ],
  template: `
    <div class="dashboard-page">
      <div class="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p class="subtitle">Claims processing metrics and overview</p>
        </div>
        <mat-form-field appearance="outline" class="range-select">
          <mat-label>Date Range</mat-label>
          <mat-select [formControl]="rangeCtrl">
            <mat-option value="7">Last 7 days</mat-option>
            <mat-option value="30">Last 30 days</mat-option>
            <mat-option value="90">Last 90 days</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      @if (loading()) {
        <div class="spinner-center"><mat-spinner></mat-spinner></div>
      }

      @if (metrics(); as m) {
        <!-- KPI Cards -->
        <div class="kpi-grid">
          <mat-card class="kpi-card primary">
            <mat-icon>receipt_long</mat-icon>
            <div>
              <span class="kpi-value">{{ m.totalClaims | number }}</span>
              <span class="kpi-label">Total Claims</span>
            </div>
          </mat-card>

          <mat-card class="kpi-card success">
            <mat-icon>check_circle</mat-icon>
            <div>
              <span class="kpi-value">{{ approvalRate() | percent:'1.1-1' }}</span>
              <span class="kpi-label">Approval Rate</span>
            </div>
          </mat-card>

          <mat-card class="kpi-card warning">
            <mat-icon>schedule</mat-icon>
            <div>
              <span class="kpi-value">{{ m.avgProcessingHours | number:'1.1-1' }}h</span>
              <span class="kpi-label">Avg Processing Time</span>
            </div>
          </mat-card>

          <mat-card class="kpi-card money">
            <mat-icon>paid</mat-icon>
            <div>
              <span class="kpi-value">\${{ m.totalAmountProcessed | number:'1.0-0' }}</span>
              <span class="kpi-label">Total Processed</span>
            </div>
          </mat-card>
        </div>

        <!-- Charts Row -->
        <div class="charts-grid">
          <!-- Daily Volume Bar Chart -->
          <mat-card class="chart-card wide">
            <mat-card-header>
              <mat-card-title>Daily Claim Volume</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <canvas baseChart
                [data]="barChartData()"
                [options]="barChartOptions"
                [type]="'bar'"
                height="280">
              </canvas>
            </mat-card-content>
          </mat-card>

          <!-- Status Doughnut Chart -->
          <mat-card class="chart-card narrow">
            <mat-card-header>
              <mat-card-title>Status Breakdown</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <canvas baseChart
                [data]="doughnutData()"
                [options]="doughnutOptions"
                [type]="'doughnut'"
                height="280">
              </canvas>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Summary Table -->
        <mat-card class="summary-card">
          <mat-card-header>
            <mat-card-title>Status Summary</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="summary-row">
              <div class="summary-item approved">
                <mat-icon>check_circle</mat-icon>
                <span class="val">{{ m.approved | number }}</span>
                <span class="lbl">Approved</span>
              </div>
              <div class="summary-item rejected">
                <mat-icon>cancel</mat-icon>
                <span class="val">{{ m.rejected | number }}</span>
                <span class="lbl">Rejected</span>
              </div>
              <div class="summary-item pending">
                <mat-icon>hourglass_empty</mat-icon>
                <span class="val">{{ m.pending | number }}</span>
                <span class="lbl">Pending</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .dashboard-page { padding: 24px; max-width: 1300px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .subtitle { color: #666; margin: 4px 0 0; }
    .range-select { width: 180px; }
    .spinner-center { display: flex; justify-content: center; padding: 64px; }

    /* KPI Grid */
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .kpi-card {
      display: flex; align-items: center; gap: 16px;
      padding: 20px 24px; border-radius: 12px; border-left: 4px solid;
    }
    .kpi-card mat-icon { font-size: 36px; width: 36px; height: 36px; }
    .kpi-value { display: block; font-size: 26px; font-weight: 700; }
    .kpi-label { display: block; font-size: 13px; color: #666; margin-top: 2px; }
    .kpi-card.primary { border-color: #1976d2; }
    .kpi-card.primary mat-icon { color: #1976d2; }
    .kpi-card.success { border-color: #2e7d32; }
    .kpi-card.success mat-icon { color: #2e7d32; }
    .kpi-card.warning { border-color: #e65100; }
    .kpi-card.warning mat-icon { color: #e65100; }
    .kpi-card.money { border-color: #6a1b9a; }
    .kpi-card.money mat-icon { color: #6a1b9a; }

    /* Charts Grid */
    .charts-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 24px; }
    .chart-card { border-radius: 12px; }

    /* Summary */
    .summary-card { border-radius: 12px; }
    .summary-row { display: flex; gap: 32px; padding: 16px 0; }
    .summary-item { display: flex; align-items: center; gap: 12px; }
    .summary-item mat-icon { font-size: 28px; width: 28px; height: 28px; }
    .val { font-size: 22px; font-weight: 700; }
    .lbl { font-size: 13px; color: #666; }
    .approved mat-icon, .approved .val { color: #2e7d32; }
    .rejected mat-icon, .rejected .val { color: #c62828; }
    .pending mat-icon, .pending .val { color: #e65100; }
  `]
})
export class DashboardComponent implements OnInit {
  private admin = inject(AdminService);

  metrics = signal<ClaimMetrics | null>(null);
  loading = signal(false);
  rangeCtrl = new FormControl('30');

  approvalRate = computed(() => {
    const m = this.metrics();
    return m && m.totalClaims > 0 ? m.approved / m.totalClaims : 0;
  });

  barChartData = computed<ChartData<'bar'>>(() => ({
    labels: this.metrics()?.dailyBreakdown.map(d => d.date) ?? [],
    datasets: [
      { label: 'Approved', data: this.metrics()?.dailyBreakdown.map(d => d.approved) ?? [], backgroundColor: '#4caf50', borderRadius: 4 },
      { label: 'Rejected', data: this.metrics()?.dailyBreakdown.map(d => d.rejected) ?? [], backgroundColor: '#f44336', borderRadius: 4 },
    ]
  }));

  doughnutData = computed<ChartData<'doughnut'>>(() => {
    const m = this.metrics();
    return {
      labels: ['Approved', 'Rejected', 'Pending'],
      datasets: [{
        data: [m?.approved ?? 0, m?.rejected ?? 0, m?.pending ?? 0],
        backgroundColor: ['#4caf50', '#f44336', '#ff9800'],
        borderWidth: 2
      }]
    };
  });

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: { x: { stacked: false }, y: { beginAtZero: true } }
  };

  doughnutOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } }
  };

  ngOnInit() {
    this.loadMetrics();
    this.rangeCtrl.valueChanges.subscribe(() => this.loadMetrics());
  }

  loadMetrics() {
    this.loading.set(true);
    const days = parseInt(this.rangeCtrl.value ?? '30');
    const from = new Date();
    from.setDate(from.getDate() - days);

    this.admin.getMetrics(from.toISOString().split('T')[0]).subscribe({
      next: m => { this.metrics.set(m); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
