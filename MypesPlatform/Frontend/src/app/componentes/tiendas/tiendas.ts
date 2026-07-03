import { Component, OnInit, OnDestroy } from '@angular/core';
import { TiendaService } from '../../servicios/tienda';
import { WebsocketService } from '../../servicios/websocket';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tienda } from '../../modelos/tienda';
import { TiendasProductos } from '../tiendas-productos/tiendas-productos';
import { FiltrarPipe } from '../../pipes/filtrar.pipe';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tiendas',
  imports: [NgFor, NgIf, FormsModule, TiendasProductos, FiltrarPipe],
  templateUrl: './tiendas.html',
  styleUrl: './tiendas.scss',
})
export class Tiendas implements OnInit, OnDestroy {

  tiendas: Tienda[] = [];
  busquedaTienda: string = '';
  tiendaSeleccionada: Tienda | null = null;
  busquedaProducto: string = '';
  private wsSubscription: Subscription | null = null;

  constructor(
    private tienda: TiendaService,
    private websocketService: WebsocketService
  ) { }

  ngOnInit(): void {
    this.cargarTiendas();

    this.websocketService.conectar();
    this.wsSubscription = this.websocketService.messages$.subscribe(mensaje => {
      console.log("Actualización por WebSocket:", mensaje);
      this.cargarTiendas();
    });
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    this.websocketService.desconectar();
  }

  cargarTiendas(): void {
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

}
