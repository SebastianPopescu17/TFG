import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VentaDialogComponent } from './venta-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

describe('VentaDialogComponent', () => {
  let component: VentaDialogComponent;
  let fixture: ComponentFixture<VentaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VentaDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VentaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
