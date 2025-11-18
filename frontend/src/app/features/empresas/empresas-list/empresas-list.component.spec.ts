import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpresasListComponent } from './empresas-list.component';

describe('EmpresasList', () => {
  let component: EmpresasListComponent;
  let fixture: ComponentFixture<EmpresasListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpresasListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpresasListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
