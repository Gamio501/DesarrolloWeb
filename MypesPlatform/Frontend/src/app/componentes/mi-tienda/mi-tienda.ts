import { Component, OnInit } from '@angular/core';
import { Tienda } from '../../modelos/tienda';
import { TiendaService } from '../../servicios/tienda';
import { NgIf } from '@angular/common';
import { AdminProductos } from '../admin-productos/admin-productos';
import { Mapa } from '../mapa/mapa';

@Component({
  selector: 'app-mi-tienda',
  imports: [NgIf, AdminProductos, Mapa],
  templateUrl: './mi-tienda.html',
  styleUrl: './mi-tienda.scss',
})
export class MiTienda implements OnInit {
  tienda!: Tienda;
  generando = false;

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

  generarImagenTienda(): void {
    if (!this.tienda) return;
    this.generando = true;
    this.tiendaService.obtenerImagenAleatoria('tienda').subscribe({
      next: (res) => {
        this.tiendaService.actualizarImagenTienda(this.tienda.tiendaId, res.url).subscribe({
          next: () => {
            this.tienda.imagenUrl = res.url;
            this.generando = false;
          },
          error: (err) => {
            console.log('Error al guardar imagen', err);
            this.generando = false;
          }
        });
      },
      error: (err) => {
        console.log('Error al generar imagen', err);
        this.generando = false;
      }
    });
  }
}
