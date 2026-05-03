import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DirectoryService } from '../../../../core/services/directory.service';
import { Patient } from '../../../../shared/models/models';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatCardModule, 
    MatIconModule, MatButtonModule, MatTooltipModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="page-header">
      <div class="header-content">
        <h1>Patient Directory</h1>
        <p>Manage and view all registered patients across the platform.</p>
      </div>
      <button mat-raised-button color="primary">
        <mat-icon>person_add</mat-icon> New Patient
      </button>
    </div>

    <div class="container">
      @if (loading()) {
        <div class="loader">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <mat-card class="table-card">
          <table mat-table [dataSource]="patients()">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let p" class="name-cell">
                <div class="avatar">{{ p.firstName[0] }}{{ p.lastName[0] }}</div>
                <div>
                  <div class="full-name">{{ p.firstName }} {{ p.lastName }}</div>
                  <div class="email">{{ p.email }}</div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="memberId">
              <th mat-header-cell *matHeaderCellDef>Member ID</th>
              <td mat-cell *matCellDef="let p"><code>{{ p.memberId }}</code></td>
            </ng-container>

            <ng-container matColumnDef="plan">
              <th mat-header-cell *matHeaderCellDef>Insurance Plan</th>
              <td mat-cell *matCellDef="let p">
                <span class="plan-chip">{{ p.insurancePlan?.planName || 'Self-Pay' }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="dob">
              <th mat-header-cell *matHeaderCellDef>Date of Birth</th>
              <td mat-cell *matCellDef="let p">{{ p.dateOfBirth | date:'mediumDate' }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let p">
                <button mat-icon-button [matTooltip]="'View Details'">
                  <mat-icon>visibility</mat-icon>
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
    .avatar {
      width: 40px; height: 40px; border-radius: 50%; background: #e3f2fd;
      color: #1565c0; display: flex; align-items: center; justify-content: center;
      font-weight: 600; font-size: 14px;
    }
    .full-name { font-weight: 600; color: #0d1b2a; }
    .email { font-size: 12px; color: #666; }
    .plan-chip {
      background: #f1f8e9; color: #33691e; padding: 4px 12px;
      border-radius: 16px; font-size: 12px; font-weight: 600;
    }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
    .loader { display: flex; justify-content: center; padding: 48px; }
  `]
})
export class PatientsComponent implements OnInit {
  private directory = inject(DirectoryService);
  
  patients = signal<Patient[]>([]);
  loading = signal(true);
  displayedColumns = ['name', 'memberId', 'plan', 'dob', 'actions'];

  ngOnInit() {
    this.directory.getPatients().subscribe({
      next: (data) => {
        this.patients.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
