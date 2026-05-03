import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DrugLookupComponent } from './drug-lookup.component';
import { PharmacyService } from '../../../core/services/api.services';
import { FormularyResult } from '../../../shared/models/models';
import { of, throwError } from 'rxjs';

describe('DrugLookupComponent', () => {
  let pharmacySpy: jasmine.SpyObj<PharmacyService>;

  const mockFormulary: FormularyResult = {
    ndcCode: '00071-0155-23',
    drugName: 'Lipitor 20mg',
    tier: 2,
    tierLabel: 'Preferred Brand',
    copay: 35.00,
    requiresPriorAuth: false,
    coverageLimit: 365,
    alternatives: [{ ndcCode: '00093-0058-01', drugName: 'Atorvastatin 20mg', tier: 1, copay: 10 }]
  };

  beforeEach(() => {
    pharmacySpy = jasmine.createSpyObj('PharmacyService', ['getFormulary']);

    TestBed.configureTestingModule({
      imports: [DrugLookupComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: PharmacyService, useValue: pharmacySpy },
        provideRouter([]),
        provideAnimations()
      ]
    });
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(DrugLookupComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show formulary result when valid NDC entered', fakeAsync(() => {
    pharmacySpy.getFormulary.and.returnValue(of(mockFormulary));
    const fixture = TestBed.createComponent(DrugLookupComponent);
    const component = fixture.componentInstance;

    component.ndcControl.setValue('00071-0155-23');
    tick(700); // wait for debounce
    fixture.detectChanges();

    expect(pharmacySpy.getFormulary).toHaveBeenCalledWith('00071-0155-23');
    expect(component.formulary()?.drugName).toBe('Lipitor 20mg');
    expect(component.formulary()?.copay).toBe(35.00);
    expect(component.loading()).toBeFalse();
  }));

  it('should not call API for NDC shorter than 11 digits', fakeAsync(() => {
    pharmacySpy.getFormulary.and.returnValue(of(mockFormulary));
    const fixture = TestBed.createComponent(DrugLookupComponent);

    fixture.componentInstance.ndcControl.setValue('123');
    tick(700);

    expect(pharmacySpy.getFormulary).not.toHaveBeenCalled();
  }));

  it('should set notFound when API returns error', fakeAsync(() => {
    pharmacySpy.getFormulary.and.returnValue(throwError(() => new Error('Not found')));
    const fixture = TestBed.createComponent(DrugLookupComponent);
    const component = fixture.componentInstance;

    component.ndcControl.setValue('00000-0000-00');
    tick(700);

    expect(component.notFound()).toBeTrue();
    expect(component.formulary()).toBeNull();
    expect(component.loading()).toBeFalse();
  }));
});
