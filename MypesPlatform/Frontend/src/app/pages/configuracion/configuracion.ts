import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { TiendaService } from '../../core/services/tienda.service';
import { TiendaDTO } from '../../core/models/platform.models';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  template: `
    <div class="config-page">
      <h1 class="page-title">Configuración</h1>
      <p class="page-subtitle">Administra los datos de tu tienda</p>

      @if (isLoading) {
        <div class="loading-section">
          <mat-spinner diameter="36" />
        </div>
      } @else if (tienda) {
        <mat-card class="config-card" appearance="outlined">
          <mat-card-header>
            <mat-icon class="header-icon" color="primary">store</mat-icon>
            <mat-card-title>{{ tienda.nombre }}</mat-card-title>
            <mat-card-subtitle>ID: {{ tienda.tiendaId }}</mat-card-subtitle>
          </mat-card-header>
          <mat-divider></mat-divider>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Dirección</span>
                <span class="info-value">{{ tienda.direccion }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Teléfono</span>
                <span class="info-value">{{ tienda.telefono }}</span>
              </div>
              @if (tienda.latitud && tienda.longitud) {
                <div class="info-item">
                  <span class="info-label">Ubicación</span>
                  <span class="info-value">{{ tienda.latitud }}, {{ tienda.longitud }}</span>
                </div>
              }
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" routerLink="/tiendas/{{ tienda.tiendaId }}/editar">
              <mat-icon>edit</mat-icon>
              Editar tienda
            </button>
          </mat-card-actions>
        </mat-card>
      } @else {
        <mat-card class="config-card empty-card" appearance="outlined">
          <mat-card-content>
            <div class="empty-state">
              <mat-icon class="empty-icon">storefront</mat-icon>
              <p>No tienes una tienda registrada.</p>
              <button mat-raised-button color="primary" routerLink="/tiendas/nuevo">
                Crear tienda
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [
    `
      .config-page { max-width: 700px; }
      .page-title { margin: 0; font-size: 1.6rem; font-weight: 600; }
      .page-subtitle { margin: 0.25rem 0 1.5rem; color: #666; }
      .loading-section { display: flex; justify-content: center; padding: 3rem; }
      .config-card { border-radius: 16px; padding: 0.5rem; }
      .header-icon { font-size: 2rem; width: 2rem; height: 2rem; margin-right: 0.75rem; }
      .info-grid { display: grid; gap: 1.25rem; margin-top: 1rem; }
      .info-item { display: flex; flex-direction: column; gap: 0.2rem; }
      .info-label { font-size: 0.8rem; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
      .info-value { font-size: 1rem; font-weight: 500; }
      .empty-card { text-align: center; padding: 2rem; }
      .empty-state { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
      .empty-icon { font-size: 3rem; width: 3rem; height: 3rem; opacity: 0.4; }
    `,
  ],
})
export class ConfiguracionComponent implements OnInit {
  tienda: TiendaDTO | null = null;
  isLoading = true;

  constructor(private tiendaService: TiendaService) {}

  ngOnInit(): void {
    this.tiendaService.miTienda().subscribe({
      next: (data) => {
        this.tienda = data;
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }
}
