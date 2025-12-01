import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const isLoggedIn = auth.isAuthenticated();
  const url = state.url;


  if (url === '/login') {
    auth.logout();
    return true;
  }


  if (!isLoggedIn) {
    return router.parseUrl('/login');
  }

 
  if (isLoggedIn && url === '/register') {
    return router.parseUrl('/dashboard');
  }

  return true;
};
