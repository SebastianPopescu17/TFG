import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndicadoresMacroComponent } from './indicadores-macro.component';

describe('IndicadoresMacroComponent', () => {
  let component: IndicadoresMacroComponent;
  let fixture: ComponentFixture<IndicadoresMacroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndicadoresMacroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndicadoresMacroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
