import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TiendaService } from '../../core/services/tienda.service';
import { ProductoService } from '../../core/services/producto.service';
import { TiendaDTO, ProductoDTO } from '../../core/models/platform.models';

@Component({
  selector: 'app-tienda',
  imports: [CommonModule, RouterLink],
  templateUrl: './tienda.html',
  styleUrl: './tienda.scss',
})
export class Tienda implements OnInit {
  tienda: TiendaDTO | null = null;
  productos: ProductoDTO[] = [];
  isLoading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private tiendaService: TiendaService,
    private productoService: ProductoService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = 'ID de tienda inválido.';
      this.isLoading = false;
      return;
    }

    this.tiendaService.findById(id).subscribe({
      next: (data) => {
        this.tienda = data;
        this.cargarProductos(id);
      },
      error: () => {
        this.error = 'No se pudo cargar la tienda. Verifica que el ID sea correcto.';
        this.isLoading = false;
      },
    });
  }

  cargarProductos(tiendaId: number): void {
    this.productoService.findByTiendaId(tiendaId).subscribe({
      next: (data) => {
        this.productos = data;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los productos.';
        this.isLoading = false;
      },
    });
  }

  imagenTienda(nombre: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&size=240&background=e8eef5&color=0056b3&bold=true`;
  }
}
