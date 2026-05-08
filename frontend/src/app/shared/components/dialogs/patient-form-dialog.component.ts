import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Patient } from '../../../shared/models/models';

@Component({
  selector: 'app-patient-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule,
    MatDatepickerModule, MatNativeDateModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <div class="header-icon">
          <mat-icon>{{ data ? 'edit_note' : 'person_add' }}</mat-icon>
        </div>
        <div class="header-text">
          <h2>{{ data ? 'Update Patient Records' : 'New Member Enrollment' }}</h2>
          <p>Orchestrating administrative and clinical profile data</p>
        </div>
        <button mat-icon-button (click)="onCancel()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="dialog-content">
        <div class="form-grid">
          <!-- Personal Info -->
          <mat-form-field appearance="outline">
            <mat-label>First Name</mat-label>
            <input matInput formControlName="firstName" placeholder="e.g. John">
            @if (form.get('firstName')?.hasError('required')) { <mat-error>Required</mat-error> }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Last Name</mat-label>
            <input matInput formControlName="lastName" placeholder="e.g. Doe">
            @if (form.get('lastName')?.hasError('required')) { <mat-error>Required</mat-error> }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Date of Birth</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="dateOfBirth">
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Gender</mat-label>
            <mat-select formControlName="gender">
              <mat-option value="Male">Male</mat-option>
              <mat-option value="Female">Female</mat-option>
              <mat-option value="Other">Other</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Work Email</mat-label>
            <input matInput formControlName="email" type="email" placeholder="john@company.com">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Contact Number</mat-label>
            <input matInput formControlName="contactNumber" placeholder="555-0123">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Residential Address</mat-label>
            <input matInput formControlName="address" placeholder="Street, City, Zip">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Member ID</mat-label>
            <input matInput formControlName="memberId" placeholder="MEM-XXXXX">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Emergency Contact</mat-label>
            <input matInput formControlName="emergencyContact" placeholder="Name & Phone">
          </mat-form-field>

          <!-- Insurance Info -->
          <div class="full-width section-title">Insurance Information</div>

          <div class="full-width insurance-grid" formGroupName="insurancePlan">
            <mat-form-field appearance="outline">
              <mat-label>Insurance Plan Name</mat-label>
              <input matInput formControlName="planName" placeholder="e.g. Gold PPO Plus">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Payer ID</mat-label>
              <input matInput formControlName="payerId" placeholder="e.g. PAY-9981">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Deductible Amount ($)</mat-label>
              <input matInput type="number" formControlName="deductibleAmt" placeholder="0.00">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>OOP Max Amount ($)</mat-label>
              <input matInput type="number" formControlName="oopMaxAmt" placeholder="0.00">
            </mat-form-field>
          </div>
        </div>

        <div class="dialog-actions">
          <button mat-button type="button" (click)="onCancel()">Discard Changes</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
            {{ data ? 'Synchronize Records' : 'Initialize Enrollment' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .dialog-container { padding: 0; overflow: hidden; border-radius: 24px; }
    .dialog-header { 
      padding: 32px; background: #f8fafc; display: flex; align-items: center; gap: 20px;
      border-bottom: 1px solid #e2e8f0; position: relative;
    }
    .header-icon {
      width: 56px; height: 56px; background: rgba(59, 130, 246, 0.1); 
      color: var(--primary); border-radius: 16px; 
      display: flex; align-items: center; justify-content: center;
    }
    .header-icon mat-icon { font-size: 32px; width: 32px; height: 32px; }
    h2 { margin: 0; font-family: 'Outfit'; font-weight: 800; font-size: 22px; color: #1e293b; }
    p { margin: 4px 0 0; font-size: 14px; color: #64748b; font-weight: 500; }
    .close-btn { position: absolute; top: 16px; right: 16px; color: #94a3b8; }

    .dialog-content { padding: 32px; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .full-width { grid-column: span 2; }
    .section-title { 
      font-size: 11px; font-weight: 800; color: var(--primary); 
      text-transform: uppercase; letter-spacing: 1.5px; margin: 16px 0 8px;
    }
    .insurance-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }

    .dialog-actions { 
      margin-top: 32px; padding-top: 24px; border-top: 1px solid #f1f5f9;
      display: flex; justify-content: flex-end; gap: 12px;
    }
    .dialog-actions button { border-radius: 12px !important; height: 48px; padding: 0 24px; font-weight: 600; }
  `]
})
export class PatientFormDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<PatientFormDialogComponent>);
  public data = inject(MAT_DIALOG_DATA) as Patient;

  form = this.fb.group({
    firstName: [this.data?.firstName || '', Validators.required],
    lastName: [this.data?.lastName || '', Validators.required],
    dateOfBirth: [this.data?.dateOfBirth || '', Validators.required],
    gender: [this.data?.gender || 'Male', Validators.required],
    email: [this.data?.email || '', [Validators.required, Validators.email]],
    contactNumber: [this.data?.contactNumber || ''],
    address: [this.data?.address || ''],
    memberId: [this.data?.memberId || '', Validators.required],
    emergencyContact: [this.data?.emergencyContact || ''],
    insurancePlan: this.fb.group({
      planName: [this.data?.insurancePlan?.planName || ''],
      payerId: [this.data?.insurancePlan?.payerId || ''],
      deductibleAmt: [this.data?.insurancePlan?.deductibleAmt || 0],
      oopMaxAmt: [this.data?.insurancePlan?.oopMaxAmt || 0]
    })
  });

  onCancel() { this.dialogRef.close(); }

  onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
