import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { NotificacionService } from './notificacion.service';

describe('NotificacionService', () => {
  let service: NotificacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
    service = TestBed.inject(NotificacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
