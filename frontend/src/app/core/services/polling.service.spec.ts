import { TestBed } from '@angular/core/testing';
import { PollingService } from './polling.service';
import { Api } from './api.service';
import { AuthService } from './auth.service';
import { AlertasService } from './alertas-service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('PollingService', () => {
  let service: PollingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Api, AuthService, AlertasService]
    });
    service = TestBed.inject(PollingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
