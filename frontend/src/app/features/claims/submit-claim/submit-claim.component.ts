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
      <div class="header-actions">
        <a mat-button routerLink="/claims" class="back-link">
          <mat-icon>arrow_back</mat-icon> Back to Claims
        </a>
      </div>

      <div class="frosted-card slide-up">
        <div class="card-hero">
          <div class="hero-icon-box">
            <mat-icon>post_add</mat-icon>
          </div>
          <div class="hero-text">
            <h1>Submit New Claim</h1>
            <p>Intelligence-assisted clinical orchestration</p>
          </div>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="premium-form">
          <!-- Claim Information -->
          <section class="form-section">
            <h3 class="section-label">CLAIM INFORMATION</h3>
            <div class="form-grid">
              <div class="input-group">
                <label>Patient ID</label>
                <div class="pill-input">
                  <mat-icon>fingerprint</mat-icon>
                  <input type="text" formControlName="patientId" placeholder="ID-12345">
                </div>
              </div>

              <div class="input-group">
                <label>Patient Name</label>
                <div class="pill-input">
                  <mat-icon>person</mat-icon>
                  <input type="text" formControlName="patientName" placeholder="Full Name">
                </div>
              </div>

              <div class="input-group">
                <label>Provider ID</label>
                <div class="pill-input">
                  <mat-icon>badge</mat-icon>
                  <input type="text" formControlName="providerId" placeholder="NPI-998">
                </div>
              </div>

              <div class="input-group">
                <label>Provider Name</label>
                <div class="pill-input">
                  <mat-icon>medical_services</mat-icon>
                  <input type="text" formControlName="providerName" placeholder="Facility Name">
                </div>
              </div>

              <div class="input-group">
                <label>Service Date</label>
                <div class="pill-input clickable" (click)="picker.open()">
                  <mat-icon>calendar_today</mat-icon>
                  <input [matDatepicker]="picker" formControlName="serviceDate" placeholder="Select Date" readonly>
                  <mat-datepicker #picker></mat-datepicker>
                </div>
              </div>

              <div class="input-group">
                <label>Total Amount ($)</label>
                <div class="pill-input">
                  <mat-icon>payments</mat-icon>
                  <input type="number" formControlName="totalAmount" placeholder="0.00">
                </div>
              </div>
            </div>
          </section>

          <mat-divider class="premium-divider"></mat-divider>

          <!-- Line Items -->
          <section class="form-section">
            <div class="section-header">
              <h3 class="section-label">LINE ITEMS</h3>
              <button mat-button type="button" class="add-item-btn" (click)="addLineItem()">
                <mat-icon>add_circle</mat-icon> Add Service
              </button>
            </div>

            <div formArrayName="lineItems" class="line-items-list">
              @for (item of lineItems.controls; track $index) {
                <div [formGroupName]="$index" class="line-item-row">
                  <div class="pill-input mini">
                    <input formControlName="procedureCode" placeholder="CPT Code">
                  </div>
                  <div class="pill-input mini">
                    <input formControlName="diagnosisCode" placeholder="ICD-10 (Optional)">
                  </div>
                  <div class="pill-input mini qty">
                    <input type="number" formControlName="quantity" placeholder="Qty">
                  </div>
                  <div class="pill-input mini cost">
                    <span class="currency">$</span>
                    <input type="number" formControlName="unitCost" placeholder="Unit Cost">
                  </div>
                  <button mat-icon-button class="delete-btn" type="button"
                    (click)="removeLineItem($index)" [disabled]="lineItems.length === 1">
                    <mat-icon>delete_outline</mat-icon>
                  </button>
                </div>
              }
            </div>
          </section>

          @if (error()) {
            <div class="error-pill">
              <mat-icon>error_outline</mat-icon>
              <span>{{ error() }}</span>
            </div>
          }

          <div class="form-footer">
            <div class="version-tag">TanCura v1.2.0-Orchestration</div>
            <button type="submit" class="submit-hero-btn" [disabled]="form.invalid || submitting()">
              @if (submitting()) {
                <mat-spinner diameter="24"></mat-spinner>
              } @else {
                <mat-icon>send</mat-icon> Dispatch Claim
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1000px; margin: 0 auto; position: relative; }
    .header-actions { margin-bottom: 24px; }
    .back-link { 
      color: var(--text-muted) !important; font-weight: 600; display: inline-flex; align-items: center; 
      gap: 8px; text-decoration: none; transition: var(--transition); 
    }
    .back-link:hover { color: var(--text-main) !important; transform: translateX(-4px); }
    .back-link mat-icon { font-size: 20px; width: 20px; height: 20px; color: inherit !important; }

    .frosted-card {
      background: #ffffff;
      border-radius: 28px;
      border: 1px solid #e2e8f0;
      padding: 48px;
      box-shadow: var(--shadow-lg);
      color: var(--text-main);
    }

    .card-hero {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 48px;
    }
    .hero-icon-box {
      width: 64px; height: 64px;
      background: var(--primary-light); color: var(--primary);
      display: flex; align-items: center; justify-content: center;
      border-radius: 18px;
    }
    .hero-icon-box mat-icon { font-size: 32px; width: 32px; height: 32px; }
    .hero-text h1 { font-size: 32px; font-weight: 800; color: var(--text-main); margin: 0; letter-spacing: -1px; }
    .hero-text p { color: var(--text-muted); margin: 4px 0 0; font-weight: 500; font-size: 16px; }

    .section-label { font-size: 12px; font-weight: 800; color: var(--text-muted); letter-spacing: 2px; margin-bottom: 24px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
    
    .input-group { display: flex; flex-direction: column; gap: 8px; }
    .input-group label { font-size: 14px; font-weight: 700; color: var(--text-main); margin-left: 12px; }
    
    .pill-input {
      display: flex; align-items: center;
      background: #f8fafc; border-radius: 16px;
      padding: 0 20px; height: 56px;
      border: 1px solid #e2e8f0; transition: var(--transition);
    }
    .pill-input:focus-within { background: #fff; border-color: var(--primary); box-shadow: 0 0 0 4px var(--primary-light); }
    .pill-input.clickable { cursor: pointer; }
    .pill-input mat-icon { color: var(--text-muted); margin-right: 12px; font-size: 20px; width: 20px; height: 20px; }
    .pill-input input { border: none; background: transparent; outline: none; width: 100%; font-size: 15px; font-weight: 600; color: var(--text-main); }
    
    .premium-divider { margin: 48px 0; opacity: 0.1; }

    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .add-item-btn { color: var(--primary); font-weight: 700; border-radius: 12px; }
    .add-item-btn:hover { background: var(--primary-light); }

    .line-item-row { display: flex; gap: 12px; margin-bottom: 12px; align-items: center; }
    .pill-input.mini { height: 48px; border-radius: 12px; flex: 2; }
    .pill-input.mini.qty { flex: 1; }
    .pill-input.mini.cost { flex: 2; }
    .currency { color: var(--text-muted); font-weight: 700; margin-right: 4px; }
    .delete-btn { color: var(--error); }

    .error-pill {
      background: #fff1f2; color: var(--error);
      padding: 16px 24px; border-radius: 16px;
      display: flex; align-items: center; gap: 12px;
      margin-top: 32px; font-weight: 600;
    }

    .form-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 48px; }
    .version-tag { font-size: 11px; font-weight: 800; color: var(--text-muted); letter-spacing: 1px; text-transform: uppercase; }
    .submit-hero-btn {
      background: var(--primary); color: #fff;
      height: 60px; padding: 0 40px;
      border: none; border-radius: 16px;
      font-size: 17px; font-weight: 700;
      cursor: pointer; display: flex; align-items: center; gap: 12px;
      transition: var(--transition);
      box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2);
    }
    .submit-hero-btn:hover { background: var(--primary-hover); transform: translateY(-2px); box-shadow: 0 15px 30px rgba(37, 99, 235, 0.3); }
    .submit-hero-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .slide-up { animation: slideUp 0.6s ease-out; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 768px) {
      .form-grid { grid-template-columns: 1fr; }
      .line-item-row { flex-wrap: wrap; }
      .pill-input.mini { flex: 1 1 40%; }
      .frosted-card { padding: 24px; }
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
    patientName: ['', Validators.required],
    providerId: ['', Validators.required],
    providerName: ['', Validators.required],
    serviceDate: [null as Date | null, Validators.required],
    totalAmount: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0.01)]],
    lineItems: this.fb.array([this.buildLineItem()])
  });

  constructor() {
    this.lineItems.valueChanges.subscribe(() => this.calculateTotal());
  }

  calculateTotal() {
    const total = this.lineItems.controls.reduce((acc, control) => {
      const qty = control.get('quantity')?.value || 0;
      const cost = control.get('unitCost')?.value || 0;
      return acc + (qty * cost);
    }, 0);
    this.form.get('totalAmount')?.setValue(total);
  }

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

    const val = this.form.getRawValue(); // use getRawValue to get disabled totalAmount
    this.claimsService.submitClaim({
      patientId: val.patientId!,
      patientName: val.patientName!,
      providerId: val.providerId!,
      providerName: val.providerName!,
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
          `Claim ${result.claimNumber} dispatched successfully`, 'View Details', { duration: 6000 }
        ).onAction().subscribe(() => this.router.navigate(['/claims', result.claimId]));
        
        // Navigate back to the list so user can see it in the 'Pending' queue
        this.router.navigate(['/claims']);
      },
      error: () => {
        this.error.set('Failed to submit claim. Please check your inputs and try again.');
        this.submitting.set(false);
      }
    });
  }
}
