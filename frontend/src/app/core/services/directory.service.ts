import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Patient, Provider } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class DirectoryService {
  private http = inject(HttpClient);

  getPatients() {
    return this.http.get<Patient[]>(`${environment.apiUrl}/patients`);
  }

  getProviders() {
    return this.http.get<Provider[]>(`${environment.apiUrl}/providers`);
  }

  getPatientById(id: string) {
    return this.http.get<Patient>(`${environment.apiUrl}/patients/${id}`);
  }

  getProviderById(id: string) {
    return this.http.get<Provider>(`${environment.apiUrl}/providers/${id}`);
  }
}
