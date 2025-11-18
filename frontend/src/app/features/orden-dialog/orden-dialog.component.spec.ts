import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdenDialogComponent } from './orden-dialog.component';

describe('OrdenDialogComponent', () => {
  let component: OrdenDialogComponent;
  let fixture: ComponentFixture<OrdenDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdenDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdenDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
