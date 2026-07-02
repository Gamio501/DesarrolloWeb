import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard que protege rutas que requieren autenticación.
 * Si el usuario no tiene token válido, redirige a /login.
 */
export const authGuard: CanActivateFn = (_route, _state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasToken()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

/**
 * Guard que protege rutas exclusivas para ADMIN.
 * Si el usuario no es ADMIN, redirige a /home.
 */
export const adminGuard: CanActivateFn = (_route, _state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasToken() && authService.isAdmin()) {
    return true;
  }

  if (!authService.hasToken()) {
    router.navigate(['/login']);
  } else {
    router.navigate(['/home']);
  }
  return false;
};
