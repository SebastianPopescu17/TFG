import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdenesProgramadasFormComponent } from './ordenes-programadas-form.component';

describe('OrdenesProgramadasFormComponent', () => {
  let component: OrdenesProgramadasFormComponent;
  let fixture: ComponentFixture<OrdenesProgramadasFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdenesProgramadasFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdenesProgramadasFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
