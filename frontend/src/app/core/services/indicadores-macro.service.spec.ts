import { TestBed } from '@angular/core/testing';

import { IndicadoresMacroService } from './indicadores-macro.service';

describe('IndicadoresMacroService', () => {
  let service: IndicadoresMacroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IndicadoresMacroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
