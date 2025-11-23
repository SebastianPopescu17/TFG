import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ChartCacheService } from './chart-cache.service';

describe('ChartCacheService', () => {
  let service: ChartCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
    service = TestBed.inject(ChartCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
