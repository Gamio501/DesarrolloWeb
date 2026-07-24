import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../servicios/auth';

export const guestGuardGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (auth.estaLogueado()) {
    if (auth.esAdmin()) {
      router.navigate(['/mi-tienda']);
    } else {
      router.navigate(['/buscar']);
    }
    return false;
  }
  return true;
};
