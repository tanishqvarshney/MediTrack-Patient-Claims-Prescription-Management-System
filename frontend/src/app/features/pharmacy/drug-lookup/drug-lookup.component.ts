import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
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
    MatProgressSpinnerModule, MatIconModule, DecimalPipe
  ],
  template: `
    <div class="lookup-page fade-in">
      <mat-card class="lookup-card glass">
        <mat-card-header>
          <div class="header-icon">
            <mat-icon>medication</mat-icon>
          </div>
          <div class="header-text">
            <mat-card-title>Drug Formulary Search</mat-card-title>
            <mat-card-subtitle>Search our comprehensive drug list by name or NDC</mat-card-subtitle>
          </div>
        </mat-card-header>

        <mat-card-content>
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Medication Name or NDC</mat-label>
            <input matInput [formControl]="searchControl"
              placeholder="e.g. Humalog, Januvia, or 0002-3227-30">
            <mat-icon matSuffix>search</mat-icon>
            <mat-hint>Type at least 2 characters to see results</mat-hint>
          </mat-form-field>

          @if (loading()) {
            <div class="loading-state">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Searching formulary...</p>
            </div>
          }

          <div class="results-list">
            @for (drug of results(); track drug.ndcCode) {
              <div class="drug-item slide-up">
                <div class="drug-main">
                  <div class="drug-info">
                    <h2 class="drug-name">{{ drug.drugName }}</h2>
                    <span class="ndc-tag">NDC {{ drug.ndcCode }}</span>
                  </div>
                  
                  <div class="status-indicators">
                    <div class="tier-pill" [class]="'tier-' + drug.tier">
                      <mat-icon>verified</mat-icon>
                      <span>Tier {{ drug.tier }} — {{ drug.tierLabel }}</span>
                    </div>
                  </div>
                </div>

                <div class="drug-details">
                  <div class="detail-box">
                    <span class="detail-label">Your Copay</span>
                    <span class="detail-value highlight">\${{ drug.copay | number:'1.2-2' }}</span>
                  </div>
                  <div class="detail-box">
                    <span class="detail-label">Prior Authorization</span>
                    <span class="detail-value" [class.status-warn]="drug.requiresPriorAuth">
                      <mat-icon>{{ drug.requiresPriorAuth ? 'info' : 'check_circle' }}</mat-icon>
                      {{ drug.requiresPriorAuth ? 'Required' : 'Not Required' }}
                    </span>
                  </div>
                  <div class="detail-box">
                    <span class="detail-label">Quantity Limit</span>
                    <span class="detail-value">{{ drug.coverageLimit ? drug.coverageLimit + ' days' : 'None' }}</span>
                  </div>
                </div>

                @if (drug.alternatives.length > 0) {
                  <div class="alternatives-box">
                    <p class="alt-title">Recommended Alternatives (Lower Tier)</p>
                    <div class="alt-chips">
                      @for (alt of drug.alternatives; track alt.ndcCode) {
                        <div class="alt-chip">
                          <span class="name">{{ alt.drugName }}</span>
                          <span class="price">\${{ alt.copay | number:'1.2-2' }}</span>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          @if (notFound()) {
            <div class="empty-results">
              <mat-icon>history_edu</mat-icon>
              <h3>No medications found</h3>
              <p>Try searching for a different name or double-check the NDC code.</p>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .lookup-page { padding: 32px; max-width: 900px; margin: 0 auto; }
    .lookup-card { border-radius: 20px !important; padding: 24px; }
    
    .header-icon {
      width: 48px; height: 48px; background: var(--primary-light);
      color: var(--primary); border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      margin-right: 16px;
    }
    .header-icon mat-icon { font-size: 28px; width: 28px; height: 28px; }
    mat-card-title { font-family: 'Outfit', sans-serif; font-size: 24px; font-weight: 700; margin-bottom: 4px; }
    mat-card-subtitle { font-size: 15px; color: var(--text-muted); }

    .search-field { width: 100%; margin-top: 32px; margin-bottom: 12px; }
    
    .loading-state { text-align: center; padding: 48px; color: var(--text-muted); }
    .loading-state p { margin-top: 16px; font-weight: 500; }

    .results-list { margin-top: 32px; display: flex; flex-direction: column; gap: 24px; }
    
    .drug-item {
      background: #fff; border: 1px solid #f1f5f9; border-radius: 16px;
      padding: 24px; transition: var(--transition);
    }
    .drug-item:hover { border-color: var(--primary); box-shadow: var(--shadow-md); }

    .drug-main { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .drug-name { font-size: 20px; font-weight: 800; margin: 0; color: var(--text-main); font-family: 'Outfit'; }
    .ndc-tag { font-size: 12px; color: var(--text-light); font-family: monospace; font-weight: 600; text-transform: uppercase; }

    .tier-pill {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 6px 14px; border-radius: 12px; font-size: 13px; font-weight: 700;
    }
    .tier-pill mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .tier-1 { background: #f0fdf4; color: #16a34a; }
    .tier-2 { background: #eff6ff; color: #2563eb; }
    .tier-3 { background: #fffbeb; color: #d97706; }
    .tier-4 { background: #fef2f2; color: #dc2626; }

    .drug-details { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 16px; background: #f8fafc; border-radius: 12px; }
    .detail-box { display: flex; flex-direction: column; gap: 4px; }
    .detail-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .detail-value { font-size: 15px; font-weight: 600; color: var(--text-main); display: flex; align-items: center; gap: 6px; }
    .detail-value mat-icon { font-size: 18px; width: 18px; height: 18px; color: var(--success); }
    .detail-value.highlight { color: var(--primary); font-size: 18px; font-family: 'Outfit'; }
    .detail-value.status-warn { color: var(--warn); }
    .detail-value.status-warn mat-icon { color: var(--warn); }

    .alternatives-box { margin-top: 20px; padding-top: 16px; border-top: 1px dashed #e2e8f0; }
    .alt-title { font-size: 13px; font-weight: 600; color: var(--text-muted); margin-bottom: 12px; }
    .alt-chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .alt-chip {
      background: #fff; border: 1px solid #e2e8f0; padding: 6px 12px; border-radius: 8px;
      display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 500;
    }
    .alt-chip .price { color: var(--success); font-weight: 700; }

    .empty-results { text-align: center; padding: 64px 24px; color: var(--text-light); }
    .empty-results mat-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 16px; color: #e2e8f0; }
    .empty-results h3 { margin: 0; color: var(--text-muted); font-size: 20px; font-weight: 700; }
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
