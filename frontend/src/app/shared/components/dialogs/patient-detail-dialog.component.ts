import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { Patient } from '../../../shared/models/models';

@Component({
  selector: 'app-patient-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatTabsModule, MatChipsModule, DatePipe],
  template: `
    <div class="detail-container">
      <div class="header">
        <div class="avatar">{{ data.firstName[0] }}{{ data.lastName[0] }}</div>
        <div class="info">
          <h2>{{ data.firstName }} {{ data.lastName }}</h2>
          <p>Member ID: <code>{{ data.memberId }}</code> • Status: <span class="status active">Active</span></p>
        </div>
        <button mat-icon-button (click)="dialogRef.close()" class="close-btn"><mat-icon>close</mat-icon></button>
      </div>

      <mat-tab-group class="tabs">
        <mat-tab label="Demographics">
          <div class="tab-content grid">
            <div class="item">
              <label>Full Name</label>
              <span>{{ data.firstName }} {{ data.lastName }}</span>
            </div>
            <div class="item">
              <label>Date of Birth</label>
              <span>{{ data.dateOfBirth | date:'MMMM d, yyyy' }}</span>
            </div>
            <div class="item">
              <label>Gender</label>
              <span>{{ data.gender }}</span>
            </div>
            <div class="item">
              <label>Insurance Plan</label>
              <span class="plan-badge">{{ data.insurancePlan?.planName }}</span>
            </div>
            <div class="item full">
              <label>Residential Address</label>
              <span>{{ data.address }}</span>
            </div>
            <div class="item">
              <label>Contact Number</label>
              <span>{{ data.contactNumber }}</span>
            </div>
            <div class="item">
              <label>Work Email</label>
              <span>{{ data.email }}</span>
            </div>
          </div>
        </mat-tab>

        <mat-tab label="Clinical History">
          <div class="tab-content empty">
            <mat-icon>clinical_notes</mat-icon>
            <p>No medical history records available for this member.</p>
          </div>
        </mat-tab>

        <mat-tab label="Prescriptions">
          <div class="tab-content empty">
            <mat-icon>medication</mat-icon>
            <p>No active prescriptions found.</p>
          </div>
        </mat-tab>
      </mat-tab-group>

      <div class="footer">
        <button mat-stroked-button color="primary" (click)="dialogRef.close('edit')">
          <mat-icon>edit</mat-icon> Edit Records
        </button>
        <button mat-raised-button color="primary" (click)="dialogRef.close()">Done</button>
      </div>
    </div>
  `,
  styles: [`
    .detail-container { min-width: 600px; padding: 0; }
    .header { 
      padding: 32px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;
      display: flex; align-items: center; gap: 24px; position: relative;
    }
    .avatar {
      width: 64px; height: 64px; border-radius: 16px; background: var(--primary);
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-size: 24px; font-weight: 800;
    }
    h2 { margin: 0; font-family: 'Outfit'; font-weight: 800; font-size: 24px; }
    p { margin: 4px 0 0; font-size: 14px; color: #64748b; font-weight: 500; }
    .status { font-weight: 700; text-transform: uppercase; font-size: 11px; }
    .status.active { color: #10b981; }
    .close-btn { position: absolute; top: 16px; right: 16px; }

    .tabs { margin-top: 16px; }
    .tab-content { padding: 24px; min-height: 300px; }
    .tab-content.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
    .item label { display: block; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; }
    .item span { font-weight: 600; color: #1e293b; font-size: 15px; }
    .item.full { grid-column: span 2; }
    .plan-badge { background: rgba(59, 130, 246, 0.1); color: var(--primary); padding: 4px 12px; border-radius: 6px; font-size: 12px; }

    .tab-content.empty { display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94a3b8; }
    .tab-content.empty mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.2; }

    .footer { padding: 24px 32px; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 12px; }
    .footer button { border-radius: 12px !important; height: 44px; padding: 0 20px; font-weight: 600; }
  `]
})
export class PatientDetailDialogComponent {
  dialogRef = inject(MatDialogRef<PatientDetailDialogComponent>);
  public data = inject(MAT_DIALOG_DATA) as Patient;
}
