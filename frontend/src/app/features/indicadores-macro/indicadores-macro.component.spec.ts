import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { IndicadoresMacroComponent } from './indicadores-macro.component';

describe('IndicadoresMacroComponent', () => {
  let component: IndicadoresMacroComponent;
  let fixture: ComponentFixture<IndicadoresMacroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndicadoresMacroComponent],
      providers: [provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(IndicadoresMacroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
