import { Component, OnInit } from '@angular/core';
import { TiendaService } from '../../servicios/tienda';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tienda } from '../../modelos/tienda';
import { TiendasProductos } from '../tiendas-productos/tiendas-productos';
import { FiltrarPipe } from '../../pipes/filtrar.pipe';
import { MicButtonComponent } from '../mic-button/mic-button.component';
import { TiendaPerfilModalComponent } from '../tienda-perfil-modal/tienda-perfil-modal.component';

@Component({
  selector: 'app-tiendas',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, TiendasProductos, FiltrarPipe, MicButtonComponent, TiendaPerfilModalComponent],
  templateUrl: './tiendas.html',
  styleUrl: './tiendas.scss',
})
export class Tiendas implements OnInit {

  tiendas: Tienda[] = [];
  busquedaTienda: string = '';
  tiendaSeleccionada: Tienda | null = null;
  busquedaProducto: string = '';
  tiendaModalId: number | null = null;

  constructor(private tienda: TiendaService) { }

  ngOnInit(): void {
    this.cargarTiendas();
  }

  cargarTiendas(): void {
    this.tienda.listar().subscribe({
      next: (data) => {
        // Ordenar tiendas por promedioValoracion descendente (Ranking)
        this.tiendas = data.sort((a, b) => (b.promedioValoracion ?? 5.0) - (a.promedioValoracion ?? 5.0));
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

  recibirTextoVoz(texto: string): void {
    this.busquedaProducto = texto;
  }

  abrirModalPerfil(tiendaId: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.tiendaModalId = tiendaId;
  }

  cerrarModalPerfil(): void {
    this.tiendaModalId = null;
  }

  onValoracionEnviada(): void {
    this.cargarTiendas();
  }
}
