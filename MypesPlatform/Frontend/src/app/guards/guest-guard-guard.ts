import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const guestGuardGuard: CanActivateFn = (route, state) => {

  const router = inject(Router)
  const token = localStorage.getItem("token")

  if (token) {

    router.navigate(['/tiendas'])

    return false
  }
  return true

};
