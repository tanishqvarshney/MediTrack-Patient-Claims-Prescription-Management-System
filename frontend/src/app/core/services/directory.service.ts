import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, delay, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Patient, Provider } from '../../shared/models/models';

const INITIAL_PATIENTS: Patient[] = [
  { 
    patientId: 'p1', firstName: 'John', lastName: 'Doe', email: 'john@doe.com', memberId: 'MEM-001', 
    dateOfBirth: '1985-05-12', gender: 'Male', contactNumber: '555-0101', address: '123 Main St, New York, NY',
    isActive: true, insurancePlan: { planId: 'pl1', planName: 'Gold PPO Plus', payerId: 'py1', deductibleAmt: 500, oopMaxAmt: 3000 } 
  },
  { 
    patientId: 'p2', firstName: 'Jane', lastName: 'Smith', email: 'jane@smith.com', memberId: 'MEM-002', 
    dateOfBirth: '1992-08-24', gender: 'Female', contactNumber: '555-0102', address: '456 Oak Ave, Los Angeles, CA',
    isActive: true, insurancePlan: { planId: 'pl2', planName: 'Silver HMO', payerId: 'py2', deductibleAmt: 1500, oopMaxAmt: 6000 } 
  },
  { 
    patientId: 'p3', firstName: 'Robert', lastName: 'Brown', email: 'robert@brown.com', memberId: 'MEM-003', 
    dateOfBirth: '1978-11-30', gender: 'Male', contactNumber: '555-0103', address: '789 Pine Rd, Chicago, IL',
    isActive: true, insurancePlan: { planId: 'pl1', planName: 'Gold PPO Plus', payerId: 'py1', deductibleAmt: 500, oopMaxAmt: 3000 } 
  }
];

const INITIAL_PROVIDERS: Provider[] = [
  { providerId: 'pr1', name: 'Dr. Alice Winston', email: 'alice@hospital.com', npi: '1234567890', licenseNumber: 'LIC-78921', specialty: 'Cardiology', contactNumber: '555-9001', isActive: true, role: 'Admin' },
  { providerId: 'pr2', name: 'Dr. Bob Miller', email: 'bob@clinic.com', npi: '0987654321', licenseNumber: 'LIC-11223', specialty: 'General Practice', contactNumber: '555-9002', isActive: true, role: 'Provider' },
  { providerId: 'pr3', name: 'Dr. Clara Oswald', email: 'clara@medical.io', npi: '5556667777', licenseNumber: 'LIC-55443', specialty: 'Neurology', contactNumber: '555-9003', isActive: true, role: 'Provider' }
];

const PATIENTS_STORAGE_KEY = 'tancura_v1_patients_store';
const PROVIDERS_STORAGE_KEY = 'tancura_v1_providers_store';

@Injectable({ providedIn: 'root' })
export class DirectoryService {
  private http = inject(HttpClient);

  private mockPatients: Patient[] = this.loadPatientsFromStorage();
  private mockProviders: Provider[] = this.loadProvidersFromStorage();

  private loadPatientsFromStorage(): Patient[] {
    if (typeof window === 'undefined') return [...INITIAL_PATIENTS];
    try {
      const saved = localStorage.getItem(PATIENTS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('DirectoryService: Failed to load patients from storage', e);
    }
    return [...INITIAL_PATIENTS];
  }

  private savePatientsToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(this.mockPatients));
    } catch (e) {
      console.error('DirectoryService: Failed to save patients to storage', e);
    }
  }

  private loadProvidersFromStorage(): Provider[] {
    if (typeof window === 'undefined') return [...INITIAL_PROVIDERS];
    try {
      const saved = localStorage.getItem(PROVIDERS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('DirectoryService: Failed to load providers from storage', e);
    }
    return [...INITIAL_PROVIDERS];
  }

  private saveProvidersToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(PROVIDERS_STORAGE_KEY, JSON.stringify(this.mockProviders));
    } catch (e) {
      console.error('DirectoryService: Failed to save providers to storage', e);
    }
  }

  getPatients(): Observable<Patient[]> {
    return of(this.mockPatients).pipe(delay(600));
  }

  addPatient(patient: Partial<Patient>): Observable<Patient> {
    const newPatient = { 
      ...patient, 
      patientId: 'p' + Math.floor(Math.random() * 1000000), 
      isActive: true 
    } as Patient;
    this.mockPatients = [newPatient, ...this.mockPatients];
    this.savePatientsToStorage();
    return of(newPatient).pipe(delay(500));
  }

  updatePatient(id: string, patient: Partial<Patient>): Observable<Patient> {
    const idx = this.mockPatients.findIndex(p => p.patientId === id);
    if (idx !== -1) {
      this.mockPatients[idx] = { ...this.mockPatients[idx], ...patient };
      this.savePatientsToStorage();
      return of(this.mockPatients[idx]).pipe(delay(500));
    }
    return of(patient as Patient);
  }

  deletePatient(id: string): Observable<void> {
    const idx = this.mockPatients.findIndex(p => p.patientId === id);
    if (idx !== -1) {
      this.mockPatients[idx].isActive = false;
      this.savePatientsToStorage();
    }
    return of(undefined).pipe(delay(300));
  }

  getProviders(): Observable<Provider[]> {
    return of(this.mockProviders).pipe(delay(600));
  }

  addProvider(provider: Partial<Provider>): Observable<Provider> {
    const newProvider = { 
      ...provider, 
      providerId: 'pr' + Math.floor(Math.random() * 1000000), 
      isActive: true 
    } as Provider;
    this.mockProviders = [newProvider, ...this.mockProviders];
    this.saveProvidersToStorage();
    return of(newProvider).pipe(delay(500));
  }

  updateProvider(id: string, provider: Partial<Provider>): Observable<Provider> {
    const idx = this.mockProviders.findIndex(p => p.providerId === id);
    if (idx !== -1) {
      this.mockProviders[idx] = { ...this.mockProviders[idx], ...provider };
      this.saveProvidersToStorage();
      return of(this.mockProviders[idx]).pipe(delay(500));
    }
    return of(provider as Provider);
  }

  deactivateProvider(id: string): Observable<void> {
    const idx = this.mockProviders.findIndex(p => p.providerId === id);
    if (idx !== -1) {
      this.mockProviders[idx].isActive = false;
      this.saveProvidersToStorage();
    }
    return of(undefined).pipe(delay(300));
  }

  getPatientById(id: string) {
    const p = this.mockPatients.find(x => x.patientId === id);
    return p ? of(p).pipe(delay(300)) : this.http.get<Patient>(`${environment.apiUrl}/patients/${id}`);
  }

  getProviderById(id: string) {
    const p = this.mockProviders.find(x => x.providerId === id);
    return p ? of(p).pipe(delay(300)) : this.http.get<Provider>(`${environment.apiUrl}/providers/${id}`);
  }
}
