import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Provider } from '../../../shared/models/models';

@Component({
  selector: 'app-provider-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <div class="header-icon">
          <mat-icon>{{ data ? 'settings_suggest' : 'add_business' }}</mat-icon>
        </div>
        <div class="header-text">
          <h2>{{ data ? 'Update Facility Credentials' : 'New Provider Registration' }}</h2>
          <p>Orchestrating network access and clinical specialties</p>
        </div>
        <button mat-icon-button (click)="onCancel()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="dialog-content">
        <div class="form-grid">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Facility / Physician Name</mat-label>
            <input matInput formControlName="name" placeholder="e.g. Dr. Alice Winston / City General">
            @if (form.get('name')?.hasError('required')) { <mat-error>Required</mat-error> }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Specialty</mat-label>
            <mat-select formControlName="specialty">
              <mat-option value="Cardiology">Cardiology</mat-option>
              <mat-option value="General Practice">General Practice</mat-option>
              <mat-option value="Neurology">Neurology</mat-option>
              <mat-option value="Pediatrics">Pediatrics</mat-option>
              <mat-option value="Surgery">Surgery</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Role / Permissions</mat-label>
            <mat-select formControlName="role">
              <mat-option value="Provider">Clinical Provider</mat-option>
              <mat-option value="Admin">Network Admin</mat-option>
              <mat-option value="Staff">Support Staff</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>NPI Number</mat-label>
            <input matInput formControlName="npi" placeholder="10-digit NPI">
            @if (form.get('npi')?.hasError('required')) { <mat-error>Required</mat-error> }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>License Number</mat-label>
            <input matInput formControlName="licenseNumber" placeholder="e.g. LIC-99002">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Professional Email</mat-label>
            <input matInput formControlName="email" type="email" placeholder="alice@hospital.com">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Contact Number</mat-label>
            <input matInput formControlName="contactNumber" placeholder="555-9000">
          </mat-form-field>
        </div>

        <div class="dialog-actions">
          <button mat-button type="button" (click)="onCancel()">Discard</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
            {{ data ? 'Update Network Access' : 'Register Provider' }}
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

    .dialog-actions { 
      margin-top: 32px; padding-top: 24px; border-top: 1px solid #f1f5f9;
      display: flex; justify-content: flex-end; gap: 12px;
    }
    .dialog-actions button { border-radius: 12px !important; height: 48px; padding: 0 24px; font-weight: 600; }
  `]
})
export class ProviderFormDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ProviderFormDialogComponent>);
  public data = inject(MAT_DIALOG_DATA) as Provider;

  form = this.fb.group({
    name: [this.data?.name || '', Validators.required],
    specialty: [this.data?.specialty || 'General Practice', Validators.required],
    role: [this.data?.role || 'Provider', Validators.required],
    npi: [this.data?.npi || '', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    licenseNumber: [this.data?.licenseNumber || '', Validators.required],
    email: [this.data?.email || '', [Validators.required, Validators.email]],
    contactNumber: [this.data?.contactNumber || '']
  });

  onCancel() { this.dialogRef.close(); }

  onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
