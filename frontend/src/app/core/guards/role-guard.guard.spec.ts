import { TestBed } from '@angular/core/testing';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { roleGuard } from './role-guard.guard';
import { AuthService } from '../services/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('roleGuard (getCurrentUser)', () => {
  let mockAuthService: Partial<AuthService>;

  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => roleGuard(...guardParameters));

  beforeEach(() => {
    mockAuthService = {
      getCurrentUser: () => ({ role: 'admin' }),
      isAuthenticated: () => true
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: mockAuthService }]
    });
  });

  it('should allow access for admin role', () => {
    const route = { data: { role: 'admin' } } as Partial<ActivatedRouteSnapshot> as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;
    const result = executeGuard(route, state);
    expect(result).toBeTrue();
  });

  it('should block access for non-admin role', () => {
    (mockAuthService as any).getCurrentUser = () => ({ role: 'user' });
    const route = { data: { role: 'admin' } } as Partial<ActivatedRouteSnapshot> as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;
    const result = executeGuard(route, state);
    expect(result).toBeFalse();
  });
});
