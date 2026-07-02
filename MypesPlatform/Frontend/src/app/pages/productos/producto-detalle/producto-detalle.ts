import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductoService } from '../../../core/services/producto.service';
import { ProductoDTO } from '../../../core/models/platform.models';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="detail-page">
      <a mat-button routerLink="/productos" class="back-link">
        <mat-icon>arrow_back</mat-icon>
        Volver a productos
      </a>

      @if (isLoading) {
        <div class="loading-section">
          <mat-spinner diameter="36" />
        </div>
      } @else if (producto) {
        <mat-card class="detail-card" appearance="outlined">
          <mat-card-header>
            <mat-card-title>{{ producto.nombre }}</mat-card-title>
            <mat-card-subtitle>ID: {{ producto.productoId }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Precio</span>
                <span class="detail-value price">S/ {{ producto.precio }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Stock</span>
                <span class="detail-value">{{ producto.stock }} unidades</span>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button
              mat-raised-button
              color="primary"
              [routerLink]="['/productos', producto.productoId, 'editar']"
            >
              <mat-icon>edit</mat-icon>
              Editar
            </button>
          </mat-card-actions>
        </mat-card>
      }
    </div>
  `,
  styles: [
    `
      .detail-page { max-width: 600px; margin: 0 auto; }
      .back-link { margin-bottom: 1rem; }
      .loading-section { display: flex; justify-content: center; padding: 3rem; }
      .detail-card { border-radius: 16px; padding: 1rem; }
      .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1rem; }
      .detail-item { display: flex; flex-direction: column; gap: 0.25rem; }
      .detail-label { font-size: 0.8rem; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
      .detail-value { font-size: 1.3rem; font-weight: 600; }
      .detail-value.price { color: #1565c0; }
    `,
  ],
})
export class ProductoDetalleComponent implements OnInit {
  producto: ProductoDTO | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private productoService: ProductoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/productos']);
      return;
    }
  }
}
