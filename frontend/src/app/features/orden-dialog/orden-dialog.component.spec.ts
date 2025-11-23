import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OrdenDialogComponent } from './orden-dialog.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('OrdenDialogComponent', () => {
  let component: OrdenDialogComponent;
  let fixture: ComponentFixture<OrdenDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        OrdenDialogComponent,
        HttpClientTestingModule
      ],
      providers: [
        provideHttpClient(),
        { provide: MatDialogRef, useValue: { close: () => {} } },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            tipo: 'compra',
            empresa: { nombre: 'Empresa Demo', ticker: 'EMP', moneda: 'EUR' },
            precio: 123.45
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrdenDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
