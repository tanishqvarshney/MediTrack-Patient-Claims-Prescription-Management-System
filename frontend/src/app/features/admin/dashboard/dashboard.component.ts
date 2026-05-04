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
        <div class="header-main">
          <h1>Intelligence Dashboard</h1>
          <p class="subtitle">Platform-wide claims orchestration and clinical analytics</p>
        </div>
        <div class="header-actions">
          <mat-form-field appearance="outline" class="range-select">
            <mat-select [formControl]="rangeCtrl">
              <mat-option value="7">7 Days Overview</mat-option>
              <mat-option value="30">30 Days Insight</mat-option>
              <mat-option value="90">Quarterly Deep Dive</mat-option>
            </mat-select>
          </mat-form-field>
          <button mat-raised-button class="refresh-btn" (click)="loadMetrics()">
            <mat-icon>refresh</mat-icon> Refresh
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="spinner-center"><mat-spinner strokeWidth="3" diameter="50"></mat-spinner></div>
      }

      @if (metrics(); as m) {
        <div class="dashboard-grid">
          <div class="main-stats">
            <!-- KPI Row -->
            <div class="kpi-grid">
              <div class="glass-card kpi-card">
                <div class="kpi-icon blue"><mat-icon>people</mat-icon></div>
                <div class="kpi-info">
                  <span class="kpi-label">Active Patients</span>
                  <span class="kpi-value">78,452</span>
                  <span class="kpi-trend up">+5.1%</span>
                </div>
              </div>

              <div class="glass-card kpi-card">
                <div class="kpi-icon cyan"><mat-icon>receipt_long</mat-icon></div>
                <div class="kpi-info">
                  <span class="kpi-label">Claims Processed</span>
                  <span class="kpi-value">{{ m.totalClaims | number }}</span>
                  <span class="kpi-trend up">+8.3%</span>
                </div>
              </div>

              <div class="glass-card kpi-card">
                <div class="kpi-icon indigo"><mat-icon>speed</mat-icon></div>
                <div class="kpi-info">
                  <span class="kpi-label">Cycle Performance</span>
                  <span class="kpi-value">{{ approvalRate() | percent:'1.1-1' }}</span>
                  <span class="kpi-trend up">+1.4%</span>
                </div>
              </div>

              <div class="glass-card kpi-card">
                <div class="kpi-icon amber"><mat-icon>error_outline</mat-icon></div>
                <div class="kpi-info">
                  <span class="kpi-label">Denial Rate</span>
                  <span class="kpi-value">4.7%</span>
                  <span class="kpi-trend down">-0.9%</span>
                </div>
              </div>
            </div>

            <!-- Charts Grid -->
            <div class="charts-row">
              <div class="glass-card chart-container wide">
                <div class="card-header">
                  <h3>Claims Processing Overview</h3>
                  <div class="card-actions">
                    <span class="period">6 Months</span>
                  </div>
                </div>
                <div class="chart-wrapper">
                  <canvas baseChart
                    [data]="barChartData()"
                    [options]="barChartOptions"
                    [type]="'bar'"
                    height="320">
                  </canvas>
                </div>
              </div>

              <div class="glass-card chart-container">
                <div class="card-header">
                  <h3>Status Breakdown</h3>
                </div>
                <div class="chart-wrapper center">
                  <canvas baseChart
                    [data]="doughnutData()"
                    [options]="doughnutOptions"
                    [type]="'doughnut'"
                    height="300">
                  </canvas>
                </div>
              </div>
            </div>

            <!-- Key Metrics Row -->
            <div class="metrics-row">
              <div class="glass-card metric-widget">
                <span class="m-label">Average Processing Time</span>
                <span class="m-value">4.2 Days</span>
              </div>
              <div class="glass-card metric-widget">
                <span class="m-label">Clinical Accuracy</span>
                <span class="m-value">99.8%</span>
              </div>
              <div class="glass-card metric-widget">
                <span class="m-label">Network Efficiency</span>
                <span class="m-value">94.5%</span>
              </div>
            </div>
          </div>

          <!-- Right Sidebar: Activity Feed -->
          <div class="activity-sidebar">
            <div class="glass-card feed-card">
              <div class="card-header">
                <h3>Intelligence Feed</h3>
              </div>
              <div class="feed-content">
                <div class="feed-item">
                  <div class="dot blue"></div>
                  <div class="feed-body">
                    <p class="f-text">High-volume alert: 250+ claims from <strong>North Clinic</strong></p>
                    <span class="f-time">13 min ago</span>
                  </div>
                </div>
                <div class="feed-item">
                  <div class="dot cyan"></div>
                  <div class="feed-body">
                    <p class="f-text"><strong>Dr. Alisha Sharma</strong> updated claim CLM-2024-PRC-01</p>
                    <span class="f-time">18 min ago</span>
                  </div>
                </div>
                <div class="feed-item">
                  <div class="dot indigo"></div>
                  <div class="feed-body">
                    <p class="f-text">Intelligence Engine: <strong>Denial risk</strong> detected in 12 claims</p>
                    <span class="f-time">27 min ago</span>
                  </div>
                </div>
                <div class="feed-item">
                  <div class="dot amber"></div>
                  <div class="feed-body">
                    <p class="f-text">Batch processing for <strong>Aetna Silver</strong> completed</p>
                    <span class="f-time">1 hour ago</span>
                  </div>
                </div>
                <div class="feed-item">
                  <div class="dot blue"></div>
                  <div class="feed-body">
                    <p class="f-text">New provider <strong>MedGlobal</strong> onboarded</p>
                    <span class="f-time">2 hours ago</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="glass-card small-chart">
               <div class="card-header"><h3>Demographics</h3></div>
               <div class="chart-mini">
                  <!-- Placeholder for mini bar chart -->
                  <div class="mini-bars">
                    <div class="bar" style="height: 40%"></div>
                    <div class="bar" style="height: 70%"></div>
                    <div class="bar" style="height: 50%"></div>
                    <div class="bar" style="height: 90%"></div>
                    <div class="bar" style="height: 30%"></div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-page { padding: 32px; max-width: 1600px; margin: 0 auto; color: #fff; }
    
    .page-header { 
      display: flex; justify-content: space-between; align-items: flex-end; 
      margin-bottom: 40px; padding-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    h1 { font-family: 'Outfit', sans-serif; font-size: 32px; font-weight: 800; margin: 0; color: #fff; letter-spacing: -1px; }
    .subtitle { color: #94a3b8; font-size: 16px; margin: 8px 0 0; }
    
    .header-actions { display: flex; align-items: center; gap: 16px; }
    .range-select { width: 220px; }
    .refresh-btn { 
      height: 54px !important; border-radius: 12px !important; 
      background: #1e293b !important; color: #fff !important;
      border: 1px solid rgba(255,255,255,0.1) !important;
    }

    .spinner-center { display: flex; justify-content: center; padding: 100px; }

    /* Layout Grid */
    .dashboard-grid { 
      display: grid; 
      grid-template-columns: 1fr 340px; 
      gap: 24px; 
    }

    .glass-card {
      background: rgba(255, 255, 255, 0.03) !important;
      backdrop-filter: blur(20px) saturate(160%) !important;
      border: 1px solid rgba(255, 255, 255, 0.08) !important;
      border-radius: 24px;
      padding: 24px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
    }

    /* KPI Grid */
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
    .kpi-card { 
      display: flex; align-items: center; gap: 20px; padding: 24px; position: relative; overflow: hidden; 
      transition: var(--transition);
      cursor: pointer;
    }
    .kpi-card:hover { 
      transform: translateY(-6px); 
      border-color: rgba(255,255,255,0.2) !important;
      background: rgba(255,255,255,0.06) !important;
    }
    .kpi-card::after {
      content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(to right, transparent, #2563eb, transparent);
      opacity: 0; transition: var(--transition);
    }
    .kpi-card:hover::after { opacity: 1; }
    .kpi-icon {
      width: 56px; height: 56px; border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      font-size: 28px;
    }
    .kpi-icon mat-icon { font-size: 28px; width: 28px; height: 28px; }
    
    .kpi-icon.blue { background: rgba(37, 99, 235, 0.15); color: #60a5fa; }
    .kpi-icon.cyan { background: rgba(6, 182, 212, 0.15); color: #22d3ee; }
    .kpi-icon.indigo { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
    .kpi-icon.amber { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }

    .kpi-info { display: flex; flex-direction: column; }
    .kpi-label { font-size: 14px; color: #94a3b8; font-weight: 500; }
    .kpi-value { font-size: 26px; font-weight: 800; color: #fff; margin: 4px 0; font-family: 'Outfit'; }
    .kpi-trend { font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 6px; width: fit-content; }
    .kpi-trend.up { background: rgba(16, 185, 129, 0.1); color: #34d399; }
    .kpi-trend.down { background: rgba(239, 68, 68, 0.1); color: #f87171; }

    /* Charts */
    .charts-row { display: grid; grid-template-columns: 1fr 400px; gap: 24px; margin-bottom: 24px; }
    .chart-container h3 { margin: 0; font-size: 18px; font-weight: 700; color: #fff; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .chart-wrapper { width: 100%; height: 320px; }
    .chart-wrapper.center { display: flex; align-items: center; justify-content: center; }

    /* Metric Widgets */
    .metrics-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .metric-widget { display: flex; flex-direction: column; gap: 8px; }
    .m-label { color: #94a3b8; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; }
    .m-value { color: #fff; font-size: 28px; font-weight: 800; font-family: 'Outfit'; }

    /* Sidebar Feed */
    .activity-sidebar { display: flex; flex-direction: column; gap: 24px; }
    .feed-card { flex: 1; }
    .feed-content { display: flex; flex-direction: column; gap: 20px; margin-top: 10px; }
    .feed-item { display: flex; gap: 16px; align-items: flex-start; }
    .dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }
    .dot.blue { background: #3b82f6; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5); }
    .dot.cyan { background: #22d3ee; box-shadow: 0 0 10px rgba(34, 211, 238, 0.5); }
    .dot.indigo { background: #6366f1; box-shadow: 0 0 10px rgba(99, 102, 241, 0.5); }
    .dot.amber { background: #f59e0b; box-shadow: 0 0 10px rgba(245, 158, 11, 0.5); }
    
    .f-text { margin: 0; font-size: 14px; color: #e2e8f0; line-height: 1.4; }
    .f-text strong { color: #fff; }
    .f-time { font-size: 12px; color: #64748b; font-weight: 500; }

    .mini-bars { display: flex; align-items: flex-end; gap: 8px; height: 60px; margin-top: 10px; }
    .bar { flex: 1; background: linear-gradient(to top, #2563eb, #60a5fa); border-radius: 4px; }
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
