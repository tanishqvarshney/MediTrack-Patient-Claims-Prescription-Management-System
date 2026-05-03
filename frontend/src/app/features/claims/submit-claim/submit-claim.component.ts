import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClaimsService } from '../../../core/services/api.services';

@Component({
  selector: 'app-submit-claim',
  standalone: true,
  imports: [
    RouterLink, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatDatepickerModule,
    MatNativeDateModule, MatButtonModule, MatIconModule, MatDividerModule,
    MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <a mat-button routerLink="/claims">
        <mat-icon>arrow_back</mat-icon> Cancel
      </a>

      <mat-card class="form-card">
        <mat-card-header>
          <mat-icon mat-card-avatar>post_add</mat-icon>
          <mat-card-title>Submit New Claim</mat-card-title>
          <mat-card-subtitle>All fields are required unless marked optional</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <!-- Patient & Provider -->
            <h3 class="section-title">Claim Information</h3>
            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Patient ID</mat-label>
                <input matInput formControlName="patientId" placeholder="UUID">
                @if (form.get('patientId')?.hasError('required') && form.get('patientId')?.touched) {
                  <mat-error>Required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Provider ID</mat-label>
                <input matInput formControlName="providerId" placeholder="UUID">
                @if (form.get('providerId')?.hasError('required') && form.get('providerId')?.touched) {
                  <mat-error>Required</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Service Date</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="serviceDate">
                <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Total Amount ($)</mat-label>
                <input matInput type="number" formControlName="totalAmount" min="0.01" step="0.01">
                <span matTextPrefix>$&nbsp;</span>
              </mat-form-field>
            </div>

            <mat-divider></mat-divider>

            <!-- Line Items -->
            <div class="line-items-header">
              <h3 class="section-title">Line Items</h3>
              <button mat-stroked-button type="button" (click)="addLineItem()">
                <mat-icon>add</mat-icon> Add Line Item
              </button>
            </div>

            <div formArrayName="lineItems">
              @for (item of lineItems.controls; track $index) {
                <div [formGroupName]="$index" class="line-item-row">
                  <mat-form-field appearance="outline" class="code-field">
                    <mat-label>CPT Code</mat-label>
                    <input matInput formControlName="procedureCode" placeholder="e.g. 99213">
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="code-field">
                    <mat-label>ICD-10 (optional)</mat-label>
                    <input matInput formControlName="diagnosisCode" placeholder="e.g. J06.9">
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="qty-field">
                    <mat-label>Qty</mat-label>
                    <input matInput type="number" formControlName="quantity" min="1">
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="cost-field">
                    <mat-label>Unit Cost ($)</mat-label>
                    <input matInput type="number" formControlName="unitCost" min="0.01" step="0.01">
                    <span matTextPrefix>$&nbsp;</span>
                  </mat-form-field>

                  <button mat-icon-button color="warn" type="button"
                    (click)="removeLineItem($index)" [disabled]="lineItems.length === 1">
                    <mat-icon>remove_circle_outline</mat-icon>
                  </button>
                </div>
              }
            </div>

            @if (error()) {
              <div class="error-banner">
                <mat-icon>error</mat-icon> {{ error() }}
              </div>
            }

            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit"
                [disabled]="form.invalid || submitting()">
                @if (submitting()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  <mat-icon>send</mat-icon> Submit Claim
                }
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 900px; margin: 0 auto; }
    .form-card { border-radius: 12px; margin-top: 16px; }
    mat-card-content { padding-top: 16px; }
    .section-title { font-size: 15px; font-weight: 600; color: #444; margin: 24px 0 12px; }
    .form-row { display: flex; gap: 16px; }
    .half-width { flex: 1; }
    .line-items-header { display: flex; justify-content: space-between; align-items: center; margin: 24px 0 8px; }
    .line-item-row { display: flex; gap: 12px; align-items: center; margin-bottom: 8px; }
    .code-field { flex: 2; }
    .qty-field { flex: 1; }
    .cost-field { flex: 2; }
    .form-actions { display: flex; justify-content: flex-end; margin-top: 24px; }
    .error-banner {
      display: flex; align-items: center; gap: 8px;
      background: #ffebee; color: #c62828; padding: 12px 16px;
      border-radius: 8px; margin-top: 16px;
    }
  `]
})
export class SubmitClaimComponent {
  private fb = inject(FormBuilder);
  private claimsService = inject(ClaimsService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  submitting = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    patientId: ['', Validators.required],
    providerId: ['', Validators.required],
    serviceDate: [null as Date | null, Validators.required],
    totalAmount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    lineItems: this.fb.array([this.buildLineItem()])
  });

  get lineItems() { return this.form.get('lineItems') as FormArray; }

  buildLineItem() {
    return this.fb.group({
      procedureCode: ['', Validators.required],
      diagnosisCode: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitCost: [null as number | null, [Validators.required, Validators.min(0.01)]]
    });
  }

  addLineItem() { this.lineItems.push(this.buildLineItem()); }
  removeLineItem(i: number) { this.lineItems.removeAt(i); }

  onSubmit() {
    if (this.form.invalid) return;
    this.submitting.set(true);
    this.error.set(null);

    const val = this.form.value;
    this.claimsService.submitClaim({
      patientId: val.patientId!,
      providerId: val.providerId!,
      serviceDate: (val.serviceDate as Date).toISOString().split('T')[0],
      totalAmount: val.totalAmount!,
      lineItems: val.lineItems!.map((li: any) => ({
        procedureCode: li.procedureCode,
        diagnosisCode: li.diagnosisCode || undefined,
        quantity: li.quantity,
        unitCost: li.unitCost
      }))
    }).subscribe({
      next: result => {
        this.snackBar.open(
          `Claim ${result.claimNumber} submitted — ${result.status}`, 'View', { duration: 5000 }
        ).onAction().subscribe(() => this.router.navigate(['/claims', result.claimId]));
        this.router.navigate(['/claims', result.claimId]);
      },
      error: () => {
        this.error.set('Failed to submit claim. Please check your inputs and try again.');
        this.submitting.set(false);
      }
    });
  }
}
