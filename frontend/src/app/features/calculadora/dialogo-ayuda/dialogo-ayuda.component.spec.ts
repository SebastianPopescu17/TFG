import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoAyudaComponent } from './dialogo-ayuda.component';

describe('DialogoAyudaComponent', () => {
  let component: DialogoAyudaComponent;
  let fixture: ComponentFixture<DialogoAyudaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogoAyudaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogoAyudaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
