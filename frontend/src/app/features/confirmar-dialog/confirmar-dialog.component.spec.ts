import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmarDialogComponent } from './confirmar-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

describe('ConfirmarDialogComponent', () => {
  let component: ConfirmarDialogComponent;
  let fixture: ComponentFixture<ConfirmarDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmarDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => {} } }, 
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmarDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
