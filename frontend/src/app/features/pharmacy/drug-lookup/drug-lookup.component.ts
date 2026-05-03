import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { DecimalPipe } from '@angular/common';
import { debounceTime, filter, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PharmacyService } from '../../../core/services/api.services';
import { FormularyResult } from '../../../shared/models/models';

@Component({
  selector: 'app-drug-lookup',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatChipsModule, MatProgressSpinnerModule, MatIconModule, MatDividerModule, DecimalPipe
  ],
  template: `
    <div class="lookup-page">
      <mat-card class="lookup-card">
        <mat-card-header>
          <mat-icon mat-card-avatar>medication</mat-icon>
          <mat-card-title>Prescription Benefit Lookup</mat-card-title>
          <mat-card-subtitle>Enter an NDC drug code to view formulary details</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>NDC Drug Code</mat-label>
            <input matInput [formControl]="ndcControl"
              placeholder="e.g. 00071-0155-23" maxlength="13">
            <mat-icon matSuffix>search</mat-icon>
            <mat-hint>Enter 11-digit NDC code (e.g. 00071-0155-23)</mat-hint>
          </mat-form-field>

          @if (loading()) {
            <div class="spinner-wrap">
              <mat-spinner diameter="48"></mat-spinner>
            </div>
          }

          @if (formulary(); as drug) {
            <div class="result-section">
              <h2 class="drug-name">{{ drug.drugName }}</h2>
              <div class="tier-badge" [class]="'tier-' + drug.tier">
                <mat-icon>grade</mat-icon>
                Tier {{ drug.tier }} — {{ drug.tierLabel }}
              </div>

              <div class="detail-grid">
                <div class="detail-item">
                  <span class="label">Copay</span>
                  <span class="value accent">\${{ drug.copay | number:'1.2-2' }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Prior Auth Required</span>
                  <span class="value" [class.warn]="drug.requiresPriorAuth">
                    <mat-icon>{{ drug.requiresPriorAuth ? 'warning' : 'check_circle' }}</mat-icon>
                    {{ drug.requiresPriorAuth ? 'Yes' : 'No' }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="label">Coverage Limit</span>
                  <span class="value">{{ drug.coverageLimit ? drug.coverageLimit + ' days/year' : 'No limit' }}</span>
                </div>
              </div>

              @if (drug.alternatives.length > 0) {
                <mat-divider></mat-divider>
                <h3>Generic Alternatives</h3>
                <div class="alternatives">
                  @for (alt of drug.alternatives; track alt.ndcCode) {
                    <div class="alt-card">
                      <span class="alt-name">{{ alt.drugName }}</span>
                      <span class="alt-tier">Tier {{ alt.tier }}</span>
                      <span class="alt-copay">\${{ alt.copay | number:'1.2-2' }}</span>
                    </div>
                  }
                </div>
              }
            </div>
          }

          @if (notFound()) {
            <div class="not-found">
              <mat-icon>search_off</mat-icon>
              <p>No formulary data found for this NDC code.</p>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .lookup-page { padding: 24px; max-width: 720px; margin: 0 auto; }
    .lookup-card { border-radius: 12px; }
    .full-width { width: 100%; margin-top: 16px; }
    .spinner-wrap { display: flex; justify-content: center; padding: 32px; }
    .result-section { padding-top: 24px; }
    .drug-name { font-size: 24px; font-weight: 700; margin: 0 0 12px; }
    .tier-badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: 20px; font-weight: 600; margin-bottom: 20px;
    }
    .tier-1 { background: #e8f5e9; color: #2e7d32; }
    .tier-2 { background: #e3f2fd; color: #1565c0; }
    .tier-3 { background: #fff3e0; color: #e65100; }
    .tier-4 { background: #fce4ec; color: #ad1457; }
    .detail-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .detail-item { display: flex; flex-direction: column; gap: 4px; }
    .label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: .5px; }
    .value { font-size: 18px; font-weight: 600; display: flex; align-items: center; gap: 4px; }
    .value.accent { color: #1976d2; }
    .value.warn { color: #e65100; }
    .alternatives { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
    .alt-card {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; background: #f5f5f5; border-radius: 8px;
    }
    .alt-name { font-weight: 500; }
    .alt-tier, .alt-copay { color: #666; font-size: 14px; }
    .not-found { text-align: center; padding: 32px; color: #999; }
    .not-found mat-icon { font-size: 48px; display: block; margin-bottom: 8px; }
  `]
})
export class DrugLookupComponent {
  private pharmacy = inject(PharmacyService);

  ndcControl = new FormControl('');
  formulary = signal<FormularyResult | null>(null);
  loading = signal(false);
  notFound = signal(false);

  constructor() {
    this.ndcControl.valueChanges.pipe(
      debounceTime(600),
      filter(v => !!v && v.replace(/-/g, '').length >= 11),
      switchMap(code => {
        this.loading.set(true);
        this.notFound.set(false);
        this.formulary.set(null);
        return this.pharmacy.getFormulary(code!);
      }),
      takeUntilDestroyed()
    ).subscribe({
      next: result => {
        this.formulary.set(result);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notFound.set(true);
      }
    });
  }
}
