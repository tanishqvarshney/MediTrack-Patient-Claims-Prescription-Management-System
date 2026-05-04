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
          <mat-card-title>Drug Formulary Search</mat-card-title>
          <mat-card-subtitle>Search by drug name or 11-digit NDC code</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Search Drug</mat-label>
            <input matInput [formControl]="searchControl"
              placeholder="e.g. Humalog or 0002-3227-30">
            <mat-icon matSuffix>search</mat-icon>
            <mat-hint>Try searching for "Humalog", "Lipitor", or an NDC code</mat-hint>
          </mat-form-field>

          @if (loading()) {
            <div class="spinner-wrap">
              <mat-spinner diameter="48"></mat-spinner>
            </div>
          }

          <div class="results-container">
            @for (drug of results(); track drug.ndcCode) {
              <div class="result-section">
                <div class="result-header">
                  <h2 class="drug-name">{{ drug.drugName }}</h2>
                  <span class="ndc-text">NDC: {{ drug.ndcCode }}</span>
                </div>
                
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
                    <span class="label">Prior Auth</span>
                    <span class="value" [class.warn]="drug.requiresPriorAuth">
                      <mat-icon>{{ drug.requiresPriorAuth ? 'warning' : 'check_circle' }}</mat-icon>
                      {{ drug.requiresPriorAuth ? 'Yes' : 'No' }}
                    </span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Limit</span>
                    <span class="value">{{ drug.coverageLimit ? drug.coverageLimit + ' days' : 'None' }}</span>
                  </div>
                </div>

                @if (drug.alternatives.length > 0) {
                  <div class="alternatives-section">
                    <h3>Lower Tier Alternatives</h3>
                    <div class="alternatives">
                      @for (alt of drug.alternatives; track alt.ndcCode) {
                        <div class="alt-card">
                          <span class="alt-name">{{ alt.drugName }}</span>
                          <span class="alt-tier">Tier {{ alt.tier }}</span>
                          <span class="alt-copay">\${{ alt.copay | number:'1.2-2' }}</span>
                        </div>
                      }
                    </div>
                  </div>
                }
                <mat-divider class="section-divider"></mat-divider>
              </div>
            }
          </div>

          @if (notFound()) {
            <div class="not-found">
              <mat-icon>search_off</mat-icon>
              <p>No drugs found matching your search.</p>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .lookup-page { padding: 24px; max-width: 800px; margin: 0 auto; }
    .lookup-card { border-radius: 12px; }
    .full-width { width: 100%; margin-top: 16px; margin-bottom: 8px; }
    .spinner-wrap { display: flex; justify-content: center; padding: 32px; }
    .results-container { margin-top: 24px; }
    .result-section { margin-bottom: 32px; animation: fadeIn 0.3s ease-out; }
    .result-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
    .drug-name { font-size: 22px; font-weight: 700; margin: 0; color: #2c3e50; }
    .ndc-text { font-family: monospace; color: #666; font-size: 14px; }
    .tier-badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 4px 12px; border-radius: 16px; font-weight: 600; margin-bottom: 16px;
      font-size: 13px;
    }
    .tier-1 { background: #e8f5e9; color: #2e7d32; }
    .tier-2 { background: #e3f2fd; color: #1565c0; }
    .tier-3 { background: #fff3e0; color: #e65100; }
    .tier-4 { background: #fce4ec; color: #ad1457; }
    .detail-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
    .detail-item { display: flex; flex-direction: column; gap: 2px; }
    .label { font-size: 11px; color: #888; text-transform: uppercase; }
    .value { font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: 4px; }
    .value mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .value.accent { color: #1976d2; }
    .value.warn { color: #e65100; }
    .alternatives-section h3 { font-size: 14px; color: #555; margin: 0 0 8px; }
    .alternatives { display: flex; flex-direction: column; gap: 6px; }
    .alt-card {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 12px; background: #f8f9fa; border: 1px solid #eee; border-radius: 6px;
    }
    .alt-name { font-weight: 500; font-size: 14px; }
    .alt-tier, .alt-copay { color: #666; font-size: 13px; }
    .section-divider { margin: 24px 0; }
    .not-found { text-align: center; padding: 48px; color: #999; }
    .not-found mat-icon { font-size: 48px; display: block; margin: 0 auto 8px; }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class DrugLookupComponent {
  private pharmacy = inject(PharmacyService);

  searchControl = new FormControl('');
  results = signal<FormularyResult[]>([]);
  loading = signal(false);
  notFound = signal(false);

  constructor() {
    this.searchControl.valueChanges.pipe(
      debounceTime(500),
      filter(v => !!v && v.length >= 2),
      switchMap(query => {
        this.loading.set(true);
        this.notFound.set(false);
        this.results.set([]);
        return this.pharmacy.searchFormulary(query!);
      }),
      takeUntilDestroyed()
    ).subscribe({
      next: data => {
        this.results.set(data);
        this.loading.set(false);
        this.notFound.set(data.length === 0);
      },
      error: () => {
        this.loading.set(false);
        this.notFound.set(true);
      }
    });
  }
}
