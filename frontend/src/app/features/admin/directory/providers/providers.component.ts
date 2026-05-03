import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DirectoryService } from '../../../../core/services/directory.service';
import { Provider } from '../../../../shared/models/models';

@Component({
  selector: 'app-providers',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatCardModule, 
    MatIconModule, MatButtonModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="page-header">
      <div class="header-content">
        <h1>Provider Network</h1>
        <p>Monitor and manage healthcare providers within the MediTrack network.</p>
      </div>
      <button mat-raised-button color="primary">
        <mat-icon>add_business</mat-icon> Add Provider
      </button>
    </div>

    <div class="container">
      @if (loading()) {
        <div class="loader">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <mat-card class="table-card">
          <table mat-table [dataSource]="providers()">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Facility / Physician</th>
              <td mat-cell *matCellDef="let p" class="name-cell">
                <div class="avatar-box">
                  <mat-icon>{{ getIcon(p.specialty) }}</mat-icon>
                </div>
                <div>
                  <div class="full-name">{{ p.name }}</div>
                  <div class="specialty">{{ p.specialty }}</div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="npi">
              <th mat-header-cell *matHeaderCellDef>NPI Number</th>
              <td mat-cell *matCellDef="let p"><code>{{ p.npi }}</code></td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let p">
                <span class="status-indicator" [class.active]="p.isActive">
                  {{ p.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let p">
                <button mat-icon-button>
                  <mat-icon>settings</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .page-header {
      padding: 24px 32px; background: #fff; border-bottom: 1px solid #e0e0e0;
      display: flex; justify-content: space-between; align-items: center;
    }
    h1 { margin: 0; font-size: 24px; font-weight: 700; color: #0d1b2a; }
    p { margin: 4px 0 0; color: #666; }
    .container { padding: 32px; }
    .table-card { border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    table { width: 100%; }
    .name-cell { display: flex; align-items: center; gap: 12px; padding: 12px 0; }
    .avatar-box {
      width: 40px; height: 40px; border-radius: 8px; background: #f5f5f5;
      color: #757575; display: flex; align-items: center; justify-content: center;
    }
    .full-name { font-weight: 600; color: #0d1b2a; }
    .specialty { font-size: 12px; color: #1976d2; font-weight: 500; }
    .status-indicator {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      padding: 2px 8px; border-radius: 4px; background: #eee; color: #666;
    }
    .status-indicator.active { background: #e8f5e9; color: #2e7d32; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
    .loader { display: flex; justify-content: center; padding: 48px; }
  `]
})
export class ProvidersComponent implements OnInit {
  private directory = inject(DirectoryService);
  
  providers = signal<Provider[]>([]);
  loading = signal(true);
  displayedColumns = ['name', 'npi', 'status', 'actions'];

  ngOnInit() {
    this.directory.getProviders().subscribe({
      next: (data) => {
        this.providers.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getIcon(specialty: string): string {
    if (specialty.includes('General')) return 'medical_services';
    if (specialty.includes('Cardiology')) return 'favorite';
    if (specialty.includes('Pediatrics')) return 'child_care';
    if (specialty.includes('Emergency')) return 'emergency';
    return 'health_and_safety';
  }
}
