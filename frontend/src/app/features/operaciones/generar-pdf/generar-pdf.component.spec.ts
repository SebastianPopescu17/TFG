import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerarPdfComponent } from './generar-pdf.component';

describe('GenerarPdfComponent', () => {
  let component: GenerarPdfComponent;
  let fixture: ComponentFixture<GenerarPdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerarPdfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerarPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
