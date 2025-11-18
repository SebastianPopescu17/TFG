import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertaFormComponent } from './alerta-form.component';

describe('AlertaForm', () => {
  let component: AlertaFormComponent;
  let fixture: ComponentFixture<AlertaFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertaFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
