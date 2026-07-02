import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductoService } from '../../core/services/producto.service';
import { TiendaService } from '../../core/services/tienda.service';
import { AuthService } from '../../core/services/auth.service';
import { ProductoDTO, TiendaDTO } from '../../core/models/platform.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="home-container">
      <section class="hero">
        <h1>Bienvenido a MypesPlatform</h1>
        <p class="hero-subtitle">
          Descubre micro y pequeñas empresas cerca de ti
        </p>
        <mat-form-field appearance="outline" class="hero-search">
          <mat-label>Buscar tiendas o productos</mat-label>
          <input
            matInput
            [(ngModel)]="searchTerm"
            placeholder="Ej. bodega, pollo, zapatos..."
          />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </section>

      @if (isLoading) {
        <div class="loading-section">
          <mat-spinner diameter="36" />
          <p class="text-muted">Cargando...</p>
        </div>
      }

      @if (error) {
        <div class="alert alert-error">{{ error }}</div>
      }

      @if (!isLoading && !error) {
        <section class="section">
          <h2>Tiendas disponibles</h2>
          @if (filteredTiendas().length === 0) {
            <p class="empty-msg">No hay tiendas disponibles.</p>
          }
          <div class="stores-grid">
            @for (t of filteredTiendas(); track t.tiendaId) {
              <a
                [routerLink]="['/tienda', t.tiendaId]"
                class="store-card"
              >
                <img
                  class="store-card-img"
                  [src]="'https://ui-avatars.com/api/?name=' + encodeURI(t.nombre) + '&size=240&background=e8eef5&color=0056b3&bold=true'"
                  [alt]="t.nombre"
                  loading="lazy"
                />
                <div class="store-card-body">
                  <h3>{{ t.nombre }}</h3>
                  <p>{{ t.direccion }}</p>
                </div>
              </a>
            }
          </div>
        </section>

        <section class="section">
          <h2>Productos</h2>
          @if (filteredProductos().length === 0) {
            <p class="empty-msg">No hay productos disponibles.</p>
          }
          <div class="products-grid">
            @for (p of filteredProductos(); track p.productoId) {
              <mat-card class="product-card" appearance="outlined">
                <mat-card-header>
                  <mat-card-title>{{ p.nombre }}</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="product-price">S/ {{ p.precio }}</div>
                  <div class="product-stock">Stock: {{ p.stock }}</div>
                </mat-card-content>
                @if (p.tiendaId) {
                  <mat-card-actions>
                    <a mat-button color="primary" [routerLink]="['/tienda', p.tiendaId]">
                      Ver tienda
                    </a>
                  </mat-card-actions>
                }
              </mat-card>
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: [
    `
      .home-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1.5rem;
      }
      .hero {
        text-align: center;
        padding: 2.5rem 1rem 2rem;
        background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%);
        border-radius: 16px;
        margin-bottom: 2rem;
        color: #fff;
      }
      .hero h1 {
        margin: 0 0 0.4rem;
        font-size: 2rem;
        font-weight: 700;
        color: #fff;
      }
      .hero-subtitle {
        margin: 0 0 1.5rem;
        opacity: 0.85;
        font-size: 1rem;
      }
      .hero-search {
        width: 100%;
        max-width: 500px;
      }
      .loading-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        padding: 3rem 0;
      }
      .section {
        margin-bottom: 2.5rem;
      }
      .section h2 {
        margin: 0 0 1rem;
        font-size: 1.3rem;
        font-weight: 600;
      }
      .stores-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 1.25rem;
      }
      .store-card {
        display: block;
        background: #fff;
        border-radius: 12px;
        overflow: hidden;
        text-decoration: none;
        color: inherit;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .store-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
      }
      .store-card-img {
        width: 100%;
        height: 150px;
        object-fit: cover;
        background: #e8eef5;
      }
      .store-card-body {
        padding: 0.85rem 1rem;
      }
      .store-card-body h3 {
        margin: 0 0 0.25rem;
        font-size: 1.05rem;
        font-weight: 600;
      }
      .store-card-body p {
        margin: 0;
        color: #666;
        font-size: 0.85rem;
      }
      .products-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 1rem;
      }
      .product-card {
        border-radius: 12px !important;
      }
      .product-price {
        font-size: 1.3rem;
        font-weight: 700;
        color: #1565c0;
        margin: 0.5rem 0 0.25rem;
      }
      .product-stock {
        color: #666;
        font-size: 0.85rem;
      }
      .empty-msg {
        color: #999;
        text-align: center;
        padding: 2rem;
      }
      .text-muted {
        color: #999;
      }
      .alert-error {
        background: #fef2f2;
        color: #991b1b;
        border: 1px solid #fecaca;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
      }
      @media (max-width: 768px) {
        .hero h1 { font-size: 1.5rem; }
        .stores-grid, .products-grid {
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        }
      }
    `,
  ],
})
export class HomeComponent implements OnInit {
  productos: ProductoDTO[] = [];
  tiendas: TiendaDTO[] = [];
  isLoading = true;
  error = '';
  searchTerm = '';

  constructor(
    private productoService: ProductoService,
    private tiendaService: TiendaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.productoService.listar().subscribe({
      next: (data) => {
        this.productos = data;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los datos. Verifica que el backend esté corriendo.';
        this.isLoading = false;
      },
    });
    this.tiendaService.findAll().subscribe({
      next: (data) => (this.tiendas = data),
      error: () => {},
    });
  }

  encodeURI(name: string): string {
    return encodeURIComponent(name);
  }

  filteredTiendas() {
    if (!this.searchTerm.trim()) return this.tiendas;
    const q = this.searchTerm.toLowerCase();
    return this.tiendas.filter((t) => t.nombre.toLowerCase().includes(q));
  }

  filteredProductos() {
    if (!this.searchTerm.trim()) return this.productos;
    const q = this.searchTerm.toLowerCase();
    return this.productos.filter((p) => p.nombre.toLowerCase().includes(q));
  }
}
