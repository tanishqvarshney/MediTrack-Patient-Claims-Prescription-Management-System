import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, delay, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Patient, Provider } from '../../shared/models/models';
import { AuditService } from './audit.service';

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
  },
  { patientId: 'p4', firstName: 'Emily', lastName: 'Davis', email: 'emily@davis.io', memberId: 'MEM-004', dateOfBirth: '1995-02-15', gender: 'Female', contactNumber: '555-0104', address: '202 Birch Ln, Seattle, WA', isActive: true, insurancePlan: { planId: 'pl1', planName: 'Gold PPO Plus', payerId: 'py1', deductibleAmt: 500, oopMaxAmt: 3000 } },
  { patientId: 'p5', firstName: 'Michael', lastName: 'Wilson', email: 'mike@wilson.com', memberId: 'MEM-005', dateOfBirth: '1982-07-20', gender: 'Male', contactNumber: '555-0105', address: '303 Cedar Ct, Austin, TX', isActive: true, insurancePlan: { planId: 'pl2', planName: 'Silver HMO', payerId: 'py2', deductibleAmt: 1500, oopMaxAmt: 6000 } },
  { patientId: 'p6', firstName: 'Sarah', lastName: 'Miller', email: 'sarah@miller.net', memberId: 'MEM-006', dateOfBirth: '1990-12-05', gender: 'Female', contactNumber: '555-0106', address: '404 Maple Dr, Boston, MA', isActive: true, insurancePlan: { planId: 'pl1', planName: 'Gold PPO Plus', payerId: 'py1', deductibleAmt: 500, oopMaxAmt: 3000 } },
  { patientId: 'p7', firstName: 'David', lastName: 'Garcia', email: 'david@garcia.org', memberId: 'MEM-007', dateOfBirth: '1975-04-12', gender: 'Male', contactNumber: '555-0107', address: '505 Elm St, Miami, FL', isActive: true, insurancePlan: { planId: 'pl3', planName: 'Bronze Basic', payerId: 'py3', deductibleAmt: 3000, oopMaxAmt: 8000 } },
  { patientId: 'p8', firstName: 'Jessica', lastName: 'Taylor', email: 'jess@taylor.com', memberId: 'MEM-008', dateOfBirth: '1988-09-28', gender: 'Female', contactNumber: '555-0108', address: '606 Walnut Ave, Denver, CO', isActive: true, insurancePlan: { planId: 'pl1', planName: 'Gold PPO Plus', payerId: 'py1', deductibleAmt: 500, oopMaxAmt: 3000 } },
  { patientId: 'p9', firstName: 'Christopher', lastName: 'Anderson', email: 'chris@anderson.com', memberId: 'MEM-009', dateOfBirth: '1993-06-18', gender: 'Male', contactNumber: '555-0109', address: '707 Cherry St, Phoenix, AZ', isActive: true, insurancePlan: { planId: 'pl2', planName: 'Silver HMO', payerId: 'py2', deductibleAmt: 1500, oopMaxAmt: 6000 } },
  { patientId: 'p10', firstName: 'Ashley', lastName: 'Thomas', email: 'ashley@thomas.net', memberId: 'MEM-010', dateOfBirth: '1980-03-24', gender: 'Female', contactNumber: '555-0110', address: '808 Spruce Ln, Portland, OR', isActive: true, insurancePlan: { planId: 'pl1', planName: 'Gold PPO Plus', payerId: 'py1', deductibleAmt: 500, oopMaxAmt: 3000 } },
  { patientId: 'p11', firstName: 'James', lastName: 'Jackson', email: 'james@jackson.org', memberId: 'MEM-011', dateOfBirth: '1972-11-10', gender: 'Male', contactNumber: '555-0111', address: '909 Hickory Dr, Atlanta, GA', isActive: true, insurancePlan: { planId: 'pl1', planName: 'Gold PPO Plus', payerId: 'py1', deductibleAmt: 500, oopMaxAmt: 3000 } },
  { patientId: 'p12', firstName: 'Mary', lastName: 'White', email: 'mary@white.com', memberId: 'MEM-012', dateOfBirth: '1998-08-30', gender: 'Female', contactNumber: '555-0112', address: '101 Willow Way, Houston, TX', isActive: true, insurancePlan: { planId: 'pl2', planName: 'Silver HMO', payerId: 'py2', deductibleAmt: 1500, oopMaxAmt: 6000 } },
  { patientId: 'p13', firstName: 'Robert', lastName: 'Harris', email: 'rob@harris.net', memberId: 'MEM-013', dateOfBirth: '1984-01-12', gender: 'Male', contactNumber: '555-0113', address: '202 Aspen Rd, Salt Lake City, UT', isActive: true, insurancePlan: { planId: 'pl3', planName: 'Bronze Basic', payerId: 'py3', deductibleAmt: 3000, oopMaxAmt: 8000 } },
  { patientId: 'p14', firstName: 'Patricia', lastName: 'Martin', email: 'patricia@martin.com', memberId: 'MEM-014', dateOfBirth: '1991-05-15', gender: 'Female', contactNumber: '555-0114', address: '303 Sycamore St, Dallas, TX', isActive: true, insurancePlan: { planId: 'pl1', planName: 'Gold PPO Plus', payerId: 'py1', deductibleAmt: 500, oopMaxAmt: 3000 } },
  { patientId: 'p15', firstName: 'Joseph', lastName: 'Thompson', email: 'joe@thompson.org', memberId: 'MEM-015', dateOfBirth: '1979-10-22', gender: 'Male', contactNumber: '555-0115', address: '404 Juniper Dr, Nashville, TN', isActive: true, insurancePlan: { planId: 'pl1', planName: 'Gold PPO Plus', payerId: 'py1', deductibleAmt: 500, oopMaxAmt: 3000 } },
  { patientId: 'p16', firstName: 'Jennifer', lastName: 'Moore', email: 'jen@moore.com', memberId: 'MEM-016', dateOfBirth: '1986-07-04', gender: 'Female', contactNumber: '555-0116', address: '505 Redwood Ln, San Francisco, CA', isActive: true, insurancePlan: { planId: 'pl2', planName: 'Silver HMO', payerId: 'py2', deductibleAmt: 1500, oopMaxAmt: 6000 } },
  { patientId: 'p17', firstName: 'William', lastName: 'Young', email: 'will@young.net', memberId: 'MEM-017', dateOfBirth: '1994-09-12', gender: 'Male', contactNumber: '555-0117', address: '606 Sequoia Ave, Charlotte, NC', isActive: true, insurancePlan: { planId: 'pl1', planName: 'Gold PPO Plus', payerId: 'py1', deductibleAmt: 500, oopMaxAmt: 3000 } },
  { patientId: 'p18', firstName: 'Elizabeth', lastName: 'Allen', email: 'liz@allen.org', memberId: 'MEM-018', dateOfBirth: '1983-12-25', gender: 'Female', contactNumber: '555-0118', address: '707 Dogwood St, Philadelphia, PA', isActive: true, insurancePlan: { planId: 'pl3', planName: 'Bronze Basic', payerId: 'py3', deductibleAmt: 3000, oopMaxAmt: 8000 } },
  { patientId: 'p19', firstName: 'Thomas', lastName: 'King', email: 'tom@king.com', memberId: 'MEM-019', dateOfBirth: '1977-06-08', gender: 'Male', contactNumber: '555-0119', address: '808 Magnolia Dr, Orlando, FL', isActive: true, insurancePlan: { planId: 'pl1', planName: 'Gold PPO Plus', payerId: 'py1', deductibleAmt: 500, oopMaxAmt: 3000 } },
  { patientId: 'p20', firstName: 'Susan', lastName: 'Wright', email: 'susan@wright.net', memberId: 'MEM-020', dateOfBirth: '1990-11-19', gender: 'Female', contactNumber: '555-0120', address: '909 Palm St, San Diego, CA', isActive: true, insurancePlan: { planId: 'pl2', planName: 'Silver HMO', payerId: 'py2', deductibleAmt: 1500, oopMaxAmt: 6000 } },
  { patientId: 'p21', firstName: 'Charles', lastName: 'Lopez', email: 'charles@lopez.org', memberId: 'MEM-021', dateOfBirth: '1981-04-30', gender: 'Male', contactNumber: '555-0121', address: '101 Pine Ln, New Orleans, LA', isActive: true, insurancePlan: { planId: 'pl1', planName: 'Gold PPO Plus', payerId: 'py1', deductibleAmt: 500, oopMaxAmt: 3000 } },
  { patientId: 'p22', firstName: 'Margaret', lastName: 'Hill', email: 'margaret@hill.com', memberId: 'MEM-022', dateOfBirth: '1974-08-14', gender: 'Female', contactNumber: '555-0122', address: '202 Oak Dr, Indianapolis, IN', isActive: true, insurancePlan: { planId: 'pl1', planName: 'Gold PPO Plus', payerId: 'py1', deductibleAmt: 500, oopMaxAmt: 3000 } },
  { patientId: 'p23', firstName: 'Steven', lastName: 'Scott', email: 'steve@scott.net', memberId: 'MEM-023', dateOfBirth: '1989-01-26', gender: 'Male', contactNumber: '555-0123', address: '303 Maple Rd, Columbus, OH', isActive: true, insurancePlan: { planId: 'pl2', planName: 'Silver HMO', payerId: 'py2', deductibleAmt: 1500, oopMaxAmt: 6000 } }
];

const INITIAL_PROVIDERS: Provider[] = [
  { providerId: 'pr1', name: 'Dr. Alice Winston', email: 'alice@hospital.com', npi: '1234567890', licenseNumber: 'LIC-78921', specialty: 'Cardiology', contactNumber: '555-9001', isActive: true, role: 'Admin' },
  { providerId: 'pr2', name: 'Dr. Bob Miller', email: 'bob@clinic.com', npi: '0987654321', licenseNumber: 'LIC-11223', specialty: 'General Practice', contactNumber: '555-9002', isActive: true, role: 'Provider' },
  { providerId: 'pr3', name: 'Dr. Clara Oswald', email: 'clara@medical.io', npi: '5556667777', licenseNumber: 'LIC-55443', specialty: 'Neurology', contactNumber: '555-9003', isActive: true, role: 'Provider' },
  { providerId: 'pr4', name: 'Northwest Medical Group', email: 'contact@northwest.med', npi: '1112223334', licenseNumber: 'ORG-99881', specialty: 'Multi-Specialty', contactNumber: '555-1000', isActive: true, role: 'Provider' },
  { providerId: 'pr5', name: 'City General Hospital', email: 'info@citygen.org', npi: '5554443332', licenseNumber: 'ORG-77662', specialty: 'Acute Care', contactNumber: '555-2000', isActive: true, role: 'Provider' },
  { providerId: 'pr6', name: 'Valley Health Center', email: 'care@valley.io', npi: '9988776655', licenseNumber: 'ORG-55443', specialty: 'Primary Care', contactNumber: '555-3000', isActive: true, role: 'Provider' },
  { providerId: 'pr7', name: 'Lakeside Clinic', email: 'admin@lakeside.net', npi: '4455667788', licenseNumber: 'ORG-33224', specialty: 'Pediatrics', contactNumber: '555-4000', isActive: true, role: 'Provider' },
  { providerId: 'pr8', name: 'Dr. Sarah Connor', email: 'sarah@terminator.med', npi: '1010101010', licenseNumber: 'LIC-10101', specialty: 'Trauma Surgery', contactNumber: '555-1010', isActive: true, role: 'Provider' },
  { providerId: 'pr9', name: 'Dr. Gregory House', email: 'house@princeton.edu', npi: '2020202020', licenseNumber: 'LIC-20202', specialty: 'Diagnostics', contactNumber: '555-2020', isActive: true, role: 'Provider' },
  { providerId: 'pr10', name: 'Dr. Meredith Grey', email: 'grey@seattlegrace.com', npi: '3030303030', licenseNumber: 'LIC-30303', specialty: 'General Surgery', contactNumber: '555-3030', isActive: true, role: 'Provider' },
  { providerId: 'pr11', name: 'Dr. Shaun Murphy', email: 'shaun@stbonaventure.org', npi: '4040404040', licenseNumber: 'LIC-40404', specialty: 'Surgery', contactNumber: '555-4040', isActive: true, role: 'Provider' },
  { providerId: 'pr12', name: 'Central Diagnostic Lab', email: 'labs@central.com', npi: '5050505050', licenseNumber: 'ORG-50505', specialty: 'Pathology', contactNumber: '555-5050', isActive: true, role: 'Provider' },
  { providerId: 'pr13', name: 'Radiology Associates', email: 'imaging@radio.net', npi: '6060606060', licenseNumber: 'ORG-60606', specialty: 'Radiology', contactNumber: '555-6060', isActive: true, role: 'Provider' },
  { providerId: 'pr14', name: 'Sunrise Mental Health', email: 'support@sunrise.org', npi: '7070707070', licenseNumber: 'ORG-70707', specialty: 'Psychiatry', contactNumber: '555-7070', isActive: true, role: 'Provider' },
  { providerId: 'pr15', name: 'Evergreen Orthopedics', email: 'bones@evergreen.med', npi: '8080808080', licenseNumber: 'ORG-80808', specialty: 'Orthopedics', contactNumber: '555-8080', isActive: true, role: 'Provider' },
  { providerId: 'pr16', name: 'Pacific Dental Care', email: 'smile@pacific.io', npi: '9090909090', licenseNumber: 'ORG-90909', specialty: 'Dentistry', contactNumber: '555-9090', isActive: true, role: 'Provider' },
  { providerId: 'pr17', name: 'Dr. John Watson', email: 'watson@bakerst.med', npi: '1212121212', licenseNumber: 'LIC-12121', specialty: 'Internal Medicine', contactNumber: '555-1212', isActive: true, role: 'Provider' },
  { providerId: 'pr18', name: 'Dr. Beverly Crusher', email: 'crusher@enterprise.fed', npi: '1701170117', licenseNumber: 'LIC-17011', specialty: 'Exobiology', contactNumber: '555-1701', isActive: true, role: 'Provider' },
  { providerId: 'pr19', name: 'Dr. Leonard McCoy', email: 'bones@starfleet.org', npi: '1701170118', licenseNumber: 'LIC-17012', specialty: 'Surgery', contactNumber: '555-1702', isActive: true, role: 'Provider' },
  { providerId: 'pr20', name: 'Dr. Dana Scully', email: 'scully@fbi.gov', npi: '1122334455', licenseNumber: 'LIC-11221', specialty: 'Forensic Pathology', contactNumber: '555-1122', isActive: true, role: 'Provider' },
  { providerId: 'pr21', name: 'Dr. Stephen Strange', email: 'strange@sanctum.med', npi: '6677889900', licenseNumber: 'LIC-66778', specialty: 'Neurosurgery', contactNumber: '555-6677', isActive: true, role: 'Provider' },
  { providerId: 'pr22', name: 'Dr. Hannibal Lecter', email: 'lecter@baltimore.med', npi: '9900112233', licenseNumber: 'LIC-99001', specialty: 'Psychiatry', contactNumber: '555-9900', isActive: true, role: 'Provider' },
  { providerId: 'pr23', name: 'Dr. Quinn Medicine Woman', email: 'quinn@frontier.net', npi: '8877665544', licenseNumber: 'LIC-88776', specialty: 'Frontier Medicine', contactNumber: '555-8877', isActive: true, role: 'Provider' }
];

const PATIENTS_STORAGE_KEY = 'tancura_v1_patients_store';
const PROVIDERS_STORAGE_KEY = 'tancura_v1_providers_store';

@Injectable({ providedIn: 'root' })
export class DirectoryService {
  private http = inject(HttpClient);
  private auditService = inject(AuditService);

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
    this.auditService.log('Added', 'Patient', newPatient.patientId);
    return of(newPatient).pipe(delay(500));
  }

  updatePatient(id: string, patient: Partial<Patient>): Observable<Patient> {
    const idx = this.mockPatients.findIndex(p => p.patientId === id);
    if (idx !== -1) {
      this.mockPatients[idx] = { ...this.mockPatients[idx], ...patient };
      this.savePatientsToStorage();
      this.auditService.log('Modified', 'Patient', id);
      return of(this.mockPatients[idx]).pipe(delay(500));
    }
    return of(patient as Patient);
  }

  deletePatient(id: string): Observable<void> {
    const idx = this.mockPatients.findIndex(p => p.patientId === id);
    if (idx !== -1) {
      this.mockPatients[idx].isActive = false;
      this.savePatientsToStorage();
      this.auditService.log('Deleted', 'Patient', id);
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
    this.auditService.log('Added', 'Provider', newProvider.providerId);
    return of(newProvider).pipe(delay(500));
  }

  updateProvider(id: string, provider: Partial<Provider>): Observable<Provider> {
    const idx = this.mockProviders.findIndex(p => p.providerId === id);
    if (idx !== -1) {
      this.mockProviders[idx] = { ...this.mockProviders[idx], ...provider };
      this.saveProvidersToStorage();
      this.auditService.log('Modified', 'Provider', id);
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
