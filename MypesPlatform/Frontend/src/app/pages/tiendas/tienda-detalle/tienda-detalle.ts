import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TiendaService } from '../../../core/services/tienda.service';
import { ProductoService } from '../../../core/services/producto.service';
import { TiendaDTO, ProductoDTO } from '../../../core/models/platform.models';

@Component({
  selector: 'app-tienda-detalle',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
  ],
  template: `
    @if (isLoading) {
      <div class="loading-section">
        <mat-spinner diameter="36" />
        <p class="text-muted">Cargando tienda...</p>
      </div>
    }

    @if (error) {
      <div class="error-state">
        <div class="alert alert-error">{{ error }}</div>
        <a mat-raised-button routerLink="/home">Volver al inicio</a>
      </div>
    }

    @if (tienda && !isLoading) {
      <div class="detail-container">
        <div class="store-header">
          <img
            class="store-avatar"
            [src]="'https://ui-avatars.com/api/?name=' + encodeURI(tienda.nombre) + '&size=240&background=e8eef5&color=0056b3&bold=true'"
            [alt]="tienda.nombre"
          />
          <div class="store-info">
            <h1>{{ tienda.nombre }}</h1>
            <p class="info-line"><strong>Dirección:</strong> {{ tienda.direccion }}</p>
            <p class="info-line"><strong>Teléfono:</strong> {{ tienda.telefono }}</p>
          </div>
        </div>

        <section class="section">
          <h2>Productos en venta</h2>
          @if (productos.length === 0) {
            <p class="empty-msg">Esta tienda aún no tiene productos registrados.</p>
          } @else {
            <div class="products-grid">
              @for (p of productos; track p.productoId) {
                <mat-card appearance="outlined" class="product-card">
                  <mat-card-header>
                    <mat-card-title>{{ p.nombre }}</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="product-price">S/ {{ p.precio }}</div>
                    <div class="product-stock">Stock disponible: {{ p.stock }}</div>
                  </mat-card-content>
                </mat-card>
              }
            </div>
          }
        </section>

        <div class="actions">
          <a mat-stroked-button routerLink="/home">Volver al inicio</a>
          <a mat-raised-button color="primary" routerLink="/mapa">Ver en el mapa</a>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .detail-container {
        max-width: 1000px;
        margin: 0 auto;
        padding: 1.5rem;
      }
      .store-header {
        display: flex;
        gap: 1.5rem;
        align-items: center;
        background: linear-gradient(135deg, #1565c0, #0d47a1);
        border-radius: 16px;
        padding: 1.5rem;
        color: #fff;
        margin-bottom: 2rem;
      }
      .store-header h1 {
        margin: 0 0 0.5rem;
        color: #fff;
        font-size: 1.6rem;
      }
      .store-avatar {
        width: 90px;
        height: 90px;
        border-radius: 50%;
        object-fit: cover;
        background: rgba(255, 255, 255, 0.2);
        flex-shrink: 0;
      }
      .store-info {
        flex: 1;
      }
      .info-line {
        margin: 0 0 0.2rem;
        opacity: 0.9;
        font-size: 0.9rem;
      }
      .section h2 {
        margin: 0 0 1rem;
        font-size: 1.3rem;
        font-weight: 600;
      }
      .products-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 1rem;
      }
      .product-card { border-radius: 12px !important; }
      .product-price {
        font-size: 1.3rem;
        font-weight: 700;
        color: #1565c0;
        margin: 0.5rem 0 0.25rem;
      }
      .product-stock { color: #666; font-size: 0.85rem; }
      .empty-msg { color: #999; text-align: center; padding: 2rem; }
      .actions { display: flex; gap: 0.75rem; margin-top: 1.5rem; }
      .loading-section {
        display: flex; flex-direction: column; align-items: center;
        gap: 0.75rem; padding: 4rem 0;
      }
      .error-state { text-align: center; padding: 3rem 1rem; }
      .alert-error {
        background: #fef2f2; color: #991b1b;
        border: 1px solid #fecaca; padding: 0.75rem 1rem;
        border-radius: 8px; margin-bottom: 1rem; display: inline-block;
      }
      .text-muted { color: #999; }
      @media (max-width: 768px) {
        .store-header { flex-direction: column; text-align: center; }
        .store-avatar { width: 70px; height: 70px; }
      }
    `,
  ],
})
export class TiendaDetalleComponent implements OnInit {
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
        this.productoService.findByTiendaId(id).subscribe({
          next: (prods) => {
            this.productos = prods;
            this.isLoading = false;
          },
          error: () => {
            this.error = 'Error al cargar productos.';
            this.isLoading = false;
          },
        });
      },
      error: () => {
        this.error = 'No se pudo cargar la tienda.';
        this.isLoading = false;
      },
    });
  }

  encodeURI(name: string): string {
    return encodeURIComponent(name);
  }
}
