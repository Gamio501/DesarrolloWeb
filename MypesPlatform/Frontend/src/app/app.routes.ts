import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/auth.guard';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home').then((m) => m.HomeComponent),
      },
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./pages/register/register').then((m) => m.RegisterComponent),
      },
      {
        path: 'tienda/:id',
        loadComponent: () =>
          import('./pages/tiendas/tienda-detalle/tienda-detalle').then(
            (m) => m.TiendaDetalleComponent
          ),
      },
      {
        path: 'mapa',
        loadComponent: () => import('./pages/mapa/mapa').then((m) => m.MapaComponent),
      },
    ],
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard').then((m) => m.DashboardComponent),
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./pages/productos/productos').then((m) => m.ProductosComponent),
      },
      {
        path: 'productos/nuevo',
        loadComponent: () =>
          import('./pages/productos/producto-form/producto-form').then(
            (m) => m.ProductoFormComponent
          ),
      },
      {
        path: 'productos/:id/editar',
        loadComponent: () =>
          import('./pages/productos/producto-form/producto-form').then(
            (m) => m.ProductoFormComponent
          ),
      },
      {
        path: 'productos/:id',
        loadComponent: () =>
          import('./pages/productos/producto-detalle/producto-detalle').then(
            (m) => m.ProductoDetalleComponent
          ),
      },
      {
        path: 'tiendas',
        loadComponent: () =>
          import('./pages/tiendas/tiendas').then((m) => m.TiendasComponent),
      },
      {
        path: 'tiendas/nuevo',
        loadComponent: () =>
          import('./pages/tiendas/tienda-form/tienda-form').then(
            (m) => m.TiendaFormComponent
          ),
      },
      {
        path: 'tiendas/:id/editar',
        loadComponent: () =>
          import('./pages/tiendas/tienda-form/tienda-form').then(
            (m) => m.TiendaFormComponent
          ),
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('./pages/configuracion/configuracion').then(
            (m) => m.ConfiguracionComponent
          ),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./pages/perfil/perfil').then((m) => m.PerfilComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
