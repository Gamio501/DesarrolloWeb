import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Home } from './componentes/home/home';
import { MiTienda } from './componentes/mi-tienda/mi-tienda';
import { Navbar } from './componentes/navbar/navbar';
import { Databiding } from './componentes/databiding/databiding';


//para redenrizar un componente dentro de otro componente debemos importar el componente
@Component({
  selector: 'app-root',
  imports: [RouterOutlet,Home,MiTienda,Navbar,Databiding],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Frontend');
}
