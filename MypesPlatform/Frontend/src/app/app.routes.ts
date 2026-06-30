import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./componentes/home/home').then((m) => m.Home),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./componentes/formlogin/formlogin').then((m) => m.Formlogin),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./componentes/register/register').then((m) => m.Register),
  },
  {
    path: 'tienda/:id',
    loadComponent: () =>
      import('./componentes/tienda/tienda').then((m) => m.Tienda),
  },
  {
    path: 'mi-tienda',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./componentes/mi-tienda/mi-tienda').then((m) => m.MiTienda),
  },
  {
    path: 'agregar-producto',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./componentes/agregar-producto/agregar-producto').then(
        (m) => m.AgregarProducto
      ),
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
