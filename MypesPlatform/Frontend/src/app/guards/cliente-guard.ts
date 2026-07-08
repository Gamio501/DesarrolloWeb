import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../servicios/auth';

export const clienteGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.estaLogueado()) {
    router.navigate(['/login']);
    return false;
  }

  if (auth.esCliente()) {
    return true;
  }

  router.navigate(['/tiendas']);
  return false;
};
