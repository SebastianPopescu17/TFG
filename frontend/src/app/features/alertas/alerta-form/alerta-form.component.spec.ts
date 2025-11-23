import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertaFormComponent } from './alerta-form.component';

import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('AlertaFormComponent', () => {
  let component: AlertaFormComponent;
  let fixture: ComponentFixture<AlertaFormComponent>;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [AlertaFormComponent],
      providers: [
        provideHttpClient(),

        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: {} },
            queryParams: of({})
          }
        },

        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AlertaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
