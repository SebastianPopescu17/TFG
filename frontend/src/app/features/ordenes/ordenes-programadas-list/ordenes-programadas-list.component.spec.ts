import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdenesProgramadasListComponent } from './ordenes-programadas-list.component';

describe('OrdenesProgramadasListComponent', () => {
  let component: OrdenesProgramadasListComponent;
  let fixture: ComponentFixture<OrdenesProgramadasListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdenesProgramadasListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdenesProgramadasListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
