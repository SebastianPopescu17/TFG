import { TestBed } from '@angular/core/testing';
import { AlertasService } from './alertas-service';
import { Api } from './api.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AlertasService', () => {
  let service: AlertasService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Api]
    });
    service = TestBed.inject(AlertasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
