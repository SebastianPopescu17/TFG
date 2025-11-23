import { TestBed } from '@angular/core/testing';

import { ChartCacheService } from './chart-cache.service';

describe('ChartCacheService', () => {
  let service: ChartCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChartCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
