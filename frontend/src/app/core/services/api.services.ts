import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  ClaimDetail, ClaimMetrics, ClaimSummary, FormularyResult,
  PagedResult, SubmitClaimRequest, SubmitClaimResponse
} from '../../shared/models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClaimsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/claims`;

  submitClaim(request: SubmitClaimRequest) {
    return this.http.post<SubmitClaimResponse>(this.base, request);
  }

  getClaim(id: string) {
    return this.http.get<ClaimDetail>(`${this.base}/${id}`);
  }

  getClaims(params: { page?: number; pageSize?: number; status?: string; patientId?: string }) {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.patientId) httpParams = httpParams.set('patientId', params.patientId);
    return this.http.get<PagedResult<ClaimSummary>>(this.base, { params: httpParams });
  }

  getPatientClaims(patientId: string) {
    return this.http.get<PagedResult<ClaimSummary>>(`${this.base}/patient/${patientId}`);
  }

  updateStatus(claimId: string, status: string, rejectionReason?: string) {
    return this.http.put<void>(`${this.base}/${claimId}/status`, { status, rejectionReason });
  }
}

@Injectable({ providedIn: 'root' })
export class PharmacyService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/pharmacy`;

  getFormulary(ndcCode: string) {
    return this.http.get<FormularyResult>(`${this.base}/formulary/${ndcCode}`);
  }

  searchFormulary(query: string) {
    return this.http.get<FormularyResult[]>(`${this.base}/search`, { params: { query } });
  }
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin`;

  getMetrics(from?: string, to?: string) {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<ClaimMetrics>(`${this.base}/metrics/claims`, { params });
  }
}
