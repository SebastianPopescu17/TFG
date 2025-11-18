import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertasListComponent } from './alertas-list.component';

describe('AlertasList', () => {
  let component: AlertasListComponent;
  let fixture: ComponentFixture<AlertasListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertasListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertasListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
