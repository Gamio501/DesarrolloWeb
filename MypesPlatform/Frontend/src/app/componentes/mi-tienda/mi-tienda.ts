import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TiendaService } from '../../core/services/tienda.service';
import { ProductoService } from '../../core/services/producto.service';
import { TiendaDTO, ProductoDTO } from '../../core/models/platform.models';

@Component({
  selector: 'app-mi-tienda',
  imports: [CommonModule, RouterLink],
  templateUrl: './mi-tienda.html',
  styleUrl: './mi-tienda.scss',
})
export class MiTienda implements OnInit {
  tienda: TiendaDTO | null = null;
  productos: ProductoDTO[] = [];
  isLoading = true;
  error = '';

  constructor(
    private tiendaService: TiendaService,
    private productoService: ProductoService
  ) {}

  ngOnInit(): void {
    this.tiendaService.miTienda().subscribe({
      next: (data) => {
        this.tienda = data;
        this.isLoading = false;
        this.cargarProductos();
      },
      error: () => {
        this.error = 'No se pudo cargar la tienda.';
        this.isLoading = false;
      },
    });
  }

  cargarProductos(): void {
    this.productoService.misProductos().subscribe({
      next: (data) => (this.productos = data),
      error: () => console.error('Error al cargar productos'),
    });
  }
}
