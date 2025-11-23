import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ChartService } from './chart.service';

describe('ChartService', () => {
  let service: ChartService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
    service = TestBed.inject(ChartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
