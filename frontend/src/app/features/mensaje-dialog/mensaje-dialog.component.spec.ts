import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MensajeDialogComponent } from './mensaje-dialog.component';

describe('MensajeDialogComponent', () => {
  let component: MensajeDialogComponent;
  let fixture: ComponentFixture<MensajeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MensajeDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MensajeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
