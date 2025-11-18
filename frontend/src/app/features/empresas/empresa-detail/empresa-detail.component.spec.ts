import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpresaDetailComponent } from './empresa-detail.component';

describe('EmpresaDetail', () => {
  let component: EmpresaDetailComponent;
  let fixture: ComponentFixture<EmpresaDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpresaDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpresaDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
