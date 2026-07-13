import { Component, OnInit } from '@angular/core';
import { TiendaService } from '../../servicios/tienda';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tienda } from '../../modelos/tienda';
import { TiendasProductos } from '../tiendas-productos/tiendas-productos';
import { FiltrarPipe } from '../../pipes/filtrar.pipe';
import { MicButtonComponent } from '../mic-button/mic-button.component';

@Component({
  selector: 'app-tiendas',
  imports: [NgFor, NgIf, FormsModule, TiendasProductos, FiltrarPipe, MicButtonComponent],
  templateUrl: './tiendas.html',
  styleUrl: './tiendas.scss',
})
export class Tiendas implements OnInit {

  tiendas: Tienda[] = [];

  busquedaTienda: string = '';

  tiendaSeleccionada: Tienda | null = null;

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
    if (this.tiendaSeleccionada?.tiendaId === tienda.tiendaId) {
      this.tiendaSeleccionada = null;
    } else {
      this.tiendaSeleccionada = tienda;
    }
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

  /** Recibe el texto reconocido por voz y lo aplica al buscador de productos */
  recibirTextoVoz(texto: string): void {
    this.busquedaProducto = texto;
  }

}
