import { Routes } from '@angular/router';

export const PHARMACY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./drug-lookup/drug-lookup.component').then(m => m.DrugLookupComponent)
  },
  {
    path: 'prescriptions',
    loadComponent: () =>
      import('./prescription-list/prescription-list.component').then(m => m.PrescriptionListComponent)
  }
];
