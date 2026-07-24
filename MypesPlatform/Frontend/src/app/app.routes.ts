import { Routes } from '@angular/router';
import { Home } from './componentes/home/home';
import { Register } from './componentes/register/register';
import { Formlogin } from './componentes/formlogin/formlogin';
import { Tiendas } from './componentes/tiendas/tiendas';
import { MiTienda } from './componentes/mi-tienda/mi-tienda';
import { Mapa } from './componentes/mapa/mapa';
import { VoiceSearchComponent } from './componentes/voice-search/voice-search.component';
import { GateComponent } from './componentes/gate/gate.component';
import { authGuard } from './guards/auth-guard';
import { guestGuardGuard } from './guards/guest-guard-guard';
import { clienteGuard } from './guards/cliente-guard';
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [
    {
        path: '',
        component: GateComponent
    },
    {
        path: 'home',
        component: Home
    },
    {
        path: 'tiendas',
        component: Tiendas,
        canActivate: [authGuard]
    },
    {
        path: 'mapa',
        component: Mapa,
        canActivate: [clienteGuard]
    },
    {
        path: 'buscar',
        component: VoiceSearchComponent,
        canActivate: [authGuard]
    },
    {
        path: 'register',
        component: Register,
        canActivate: [guestGuardGuard]
    },
    {
        path: 'login',
        component: Formlogin,
        canActivate: [guestGuardGuard]
    },
    {
        path: 'mi-tienda',
        component: MiTienda,
        canActivate: [adminGuard]
    },
    {
        path: '**',
        redirectTo: ''
    }
];
