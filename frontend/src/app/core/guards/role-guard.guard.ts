import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const expectedRole = route.data['role'];
  const user = auth.getCurrentUser();

  if (auth.isAuthenticated() && user && user.role === expectedRole) {
    return true;
  }

  
  router.navigate(['/dashboard']);
  return false;
};
