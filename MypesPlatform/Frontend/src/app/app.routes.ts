import { Routes } from '@angular/router';
import { Home } from './componentes/home/home';
import { MiTienda } from './componentes/mi-tienda/mi-tienda';
import { Register } from './componentes/register/register';
import { Formlogin } from './componentes/formlogin/formlogin';
import { Tienda } from './componentes/tienda/tienda';
export const routes: Routes = [
   
    {
        path: 'home',
        component: Home
    }
    ,{
        path: 'mi-tienda',
        component: MiTienda
    },
    {
        path: 'register',
        component: Register
    },
    {
        path: 'login',
        component: Formlogin

    },
    {
     path: 'tienda',
     component: Tienda    
    }
    ,{
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'

    },
    {
        path:'**',
        redirectTo: 'home'
    }





];
