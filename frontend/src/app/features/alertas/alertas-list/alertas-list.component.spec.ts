import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertasListComponent } from './alertas-list.component';

import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('AlertasListComponent', () => {
  let component: AlertasListComponent;
  let fixture: ComponentFixture<AlertasListComponent>;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [AlertasListComponent],
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

    fixture = TestBed.createComponent(AlertasListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
