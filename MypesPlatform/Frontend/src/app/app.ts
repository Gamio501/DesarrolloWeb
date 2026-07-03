import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Home } from './componentes/home/home';
import { Navbar } from './componentes/navbar/navbar';
import { Tiendas } from './componentes/tiendas/tiendas';


//para redenrizar un componente dentro de otro componente debemos importar el componente
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Home, Navbar, Tiendas],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Frontend');
}
