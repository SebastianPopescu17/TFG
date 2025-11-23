import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { PreciosHistoricosComponent } from './precios-historicos.component';

describe('PreciosHistoricosComponent', () => {
  let component: PreciosHistoricosComponent;
  let fixture: ComponentFixture<PreciosHistoricosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreciosHistoricosComponent],
      providers: [provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(PreciosHistoricosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
