import { Component, OnInit } from '@angular/core';
import { TiendaService } from '../../servicios/tienda';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tienda } from '../../modelos/tienda';
import { TiendasProductos } from '../tiendas-productos/tiendas-productos';
import { FiltrarPipe } from '../../pipes/filtrar.pipe';

@Component({
  selector: 'app-tiendas',
  imports: [NgFor, NgIf, FormsModule, TiendasProductos, FiltrarPipe],
  templateUrl: './tiendas.html',
  styleUrl: './tiendas.scss',
})
export class Tiendas implements OnInit {

  tiendas: Tienda[] = [];

  // Estado de búsqueda de tiendas
  busquedaTienda: string = '';

  // Estado de tienda seleccionada (null = mostrar todas)
  tiendaSeleccionada: Tienda | null = null;

  // Estado de búsqueda de productos
  busquedaProducto: string = '';

  constructor(private tienda: TiendaService) { }

  ngOnInit(): void {
    this.tienda.listar().subscribe({
      next: (data) => {
        this.tiendas = data;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  seleccionarTienda(tienda: Tienda): void {
    // Si ya está seleccionada, deselecciona (toggle)
    if (this.tiendaSeleccionada?.tiendaId === tienda.tiendaId) {
      this.tiendaSeleccionada = null;
    } else {
      this.tiendaSeleccionada = tienda;
    }
    // Resetea la búsqueda de productos al cambiar de tienda
    this.busquedaProducto = '';
  }

  limpiarFiltros(): void {
    this.tiendaSeleccionada = null;
    this.busquedaTienda = '';
    this.busquedaProducto = '';
  }

  get tiendaIdSeleccionada(): number | null {
    return this.tiendaSeleccionada?.tiendaId ?? null;
  }

  encodeURIComponent(value: string): string {
    return encodeURIComponent(value);
  }

}
