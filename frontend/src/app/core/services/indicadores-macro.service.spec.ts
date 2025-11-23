import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { IndicadoresMacroService } from './indicadores-macro.service';

describe('IndicadoresMacroService', () => {
  let service: IndicadoresMacroService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
    service = TestBed.inject(IndicadoresMacroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
