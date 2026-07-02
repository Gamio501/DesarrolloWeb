import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TiendaService } from '../../core/services/tienda.service';
import { ProductoService } from '../../core/services/producto.service';
import { AuthService } from '../../core/services/auth.service';
import { TiendaDTO, ProductoDTO } from '../../core/models/platform.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="dashboard">
      <h1 class="page-title">Dashboard</h1>
      <p class="page-subtitle">Bienvenido, {{ username }}</p>

      @if (isLoading) {
        <div class="loading-section">
          <mat-spinner diameter="36" />
        </div>
      } @else {
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-icon class="stat-icon store-icon">store</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ tienda ? 1 : 0 }}</span>
              <span class="stat-label">Mi Tienda</span>
            </div>
          </mat-card>
          <mat-card class="stat-card">
            <mat-icon class="stat-icon product-icon">inventory_2</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ productos.length }}</span>
              <span class="stat-label">Mis Productos</span>
            </div>
          </mat-card>
          <mat-card class="stat-card">
            <mat-icon class="stat-icon all-icon">storefront</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ totalTiendas }}</span>
              <span class="stat-label">Total Tiendas</span>
            </div>
          </mat-card>
          <mat-card class="stat-card">
            <mat-icon class="stat-icon total-icon">category</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ totalProductos }}</span>
              <span class="stat-label">Total Productos</span>
            </div>
          </mat-card>
        </div>

        <div class="action-cards">
          <mat-card class="action-card" appearance="outlined" routerLink="/productos/nuevo">
            <mat-icon>add_circle</mat-icon>
            <span>Agregar Producto</span>
          </mat-card>
          <mat-card class="action-card" appearance="outlined" routerLink="/tiendas/nuevo">
            <mat-icon>add_business</mat-icon>
            <span>Crear Tienda</span>
          </mat-card>
          <mat-card class="action-card" appearance="outlined" routerLink="/productos">
            <mat-icon>list_alt</mat-icon>
            <span>Gestionar Productos</span>
          </mat-card>
          <mat-card class="action-card" appearance="outlined" routerLink="/configuracion">
            <mat-icon>settings</mat-icon>
            <span>Configuración</span>
          </mat-card>
        </div>

        @if (miTiendaError) {
          <div class="alert alert-warning">
            <mat-icon>info</mat-icon>
            <span>Aún no tienes una tienda registrada.</span>
            <a mat-button color="primary" routerLink="/tiendas/nuevo">Crear ahora</a>
          </div>
        }
      }
    </div>
  `,
  styles: [
    `
      .dashboard {
        max-width: 1000px;
      }
      .page-title {
        margin: 0;
        font-size: 1.6rem;
        font-weight: 600;
      }
      .page-subtitle {
        margin: 0.25rem 0 1.5rem;
        color: #666;
      }
      .loading-section {
        display: flex;
        justify-content: center;
        padding: 3rem;
      }
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      }
      .stat-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.25rem;
        border-radius: 12px;
      }
      .stat-icon {
        font-size: 2.2rem;
        width: 2.2rem;
        height: 2.2rem;
        padding: 0.5rem;
        border-radius: 12px;
      }
      .store-icon { color: #1565c0; background: #e3f2fd; }
      .product-icon { color: #2e7d32; background: #e8f5e9; }
      .all-icon { color: #e65100; background: #fff3e0; }
      .total-icon { color: #6a1b9a; background: #f3e5f5; }
      .stat-info {
        display: flex;
        flex-direction: column;
      }
      .stat-value {
        font-size: 1.6rem;
        font-weight: 700;
      }
      .stat-label {
        font-size: 0.8rem;
        color: #666;
      }
      .action-cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
      }
      .action-card {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem 1.25rem;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.15s;
        font-weight: 500;
      }
      .action-card:hover {
        background: #f5f5f5;
        border-color: #1565c0;
      }
      .alert-warning {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: #fff3e0;
        color: #e65100;
        border: 1px solid #ffe0b2;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        font-size: 0.9rem;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  tienda: TiendaDTO | null = null;
  productos: ProductoDTO[] = [];
  totalTiendas = 0;
  totalProductos = 0;
  username = '';
  isLoading = true;
  miTiendaError = false;

  constructor(
    private tiendaService: TiendaService,
    private productoService: ProductoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername() || 'Admin';
    this.tiendaService.miTienda().subscribe({
      next: (data) => {
        this.tienda = data;
        this.cargarProductos();
      },
      error: () => {
        this.miTiendaError = true;
        this.isLoading = false;
      },
    });
    this.tiendaService.findAll().subscribe({
      next: (data) => (this.totalTiendas = data.length),
      error: () => {},
    });
    this.productoService.listar().subscribe({
      next: (data) => (this.totalProductos = data.length),
      error: () => {},
    });
  }

  cargarProductos(): void {
    this.productoService.misProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }
}
