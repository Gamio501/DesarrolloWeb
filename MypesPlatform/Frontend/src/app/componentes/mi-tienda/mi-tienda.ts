import { Component, OnInit } from '@angular/core';
import { Tienda } from '../../modelos/tienda';
import { TiendaService } from '../../servicios/tienda';
import { NgIf, NgFor } from '@angular/common';
import { AdminProductos } from '../admin-productos/admin-productos';
import { Mapa } from '../mapa/mapa';

@Component({
  selector: 'app-mi-tienda',
  imports: [NgIf, NgFor, AdminProductos, Mapa],
  templateUrl: './mi-tienda.html',
  styleUrl: './mi-tienda.scss',
})
export class MiTienda implements OnInit {
  tienda!: Tienda;
  subiendo = false;
  buscandoFotos = false;
  resultadosBusqueda: string[] = [];
  mostrarPanelFoto = false;

  constructor(private tiendaService: TiendaService) {}

  ngOnInit(): void {
    this.tiendaService.obtenerMiTienda().subscribe({
      next: (data) => {
        this.tienda = data;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  onImagenSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const archivo = input.files[0];
    this.subiendo = true;

    this.tiendaService.subirImagen(archivo).subscribe({
      next: (res) => {
        this.tiendaService.actualizarImagenTienda(this.tienda.tiendaId, res.url).subscribe({
          next: () => {
            this.tienda.imagenUrl = res.url;
            this.subiendo = false;
          },
          error: (err) => {
            console.log('Error al guardar imagen', err);
            this.subiendo = false;
          }
        });
      },
      error: (err) => {
        console.log('Error al subir imagen', err);
        this.subiendo = false;
      }
    });
  }

  buscarFotosStock(): void {
    this.buscandoFotos = true;
    this.resultadosBusqueda = [];

    this.tiendaService.buscarFotosStock(this.tienda.nombre).subscribe({
      next: (urls) => {
        this.resultadosBusqueda = urls;
        this.buscandoFotos = false;
      },
      error: (err) => {
        console.log('Error al buscar fotos', err);
        this.buscandoFotos = false;
      }
    });
  }

  elegirFotoStock(url: string): void {
    this.subiendo = true;
    this.tiendaService.elegirFotoStock(url).subscribe({
      next: (res) => {
        this.tiendaService.actualizarImagenTienda(this.tienda.tiendaId, res.url).subscribe({
          next: () => {
            this.tienda.imagenUrl = res.url;
            this.resultadosBusqueda = [];
            this.subiendo = false;
          },
          error: (err) => {
            console.log('Error al guardar imagen', err);
            this.subiendo = false;
          }
        });
      },
      error: (err) => {
        console.log('Error al descargar imagen elegida', err);
        this.subiendo = false;
      }
    });
  }

  cancelarBusqueda(): void {
    this.resultadosBusqueda = [];
  }

  togglePanelFoto(): void {
    this.mostrarPanelFoto = !this.mostrarPanelFoto;
    if (!this.mostrarPanelFoto) {
      this.resultadosBusqueda = [];
    }
  }
}
