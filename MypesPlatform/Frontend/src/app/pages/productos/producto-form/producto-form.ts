import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductoService } from '../../../core/services/producto.service';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="form-page">
      <a mat-button routerLink="/productos" class="back-link">
        <mat-icon>arrow_back</mat-icon>
        Volver a productos
      </a>

      <mat-card class="form-card" appearance="outlined">
        <mat-card-header>
          <mat-card-title>{{ isEdit ? 'Editar' : 'Nuevo' }} Producto</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (errorMessage) {
            <div class="alert alert-error">{{ errorMessage }}</div>
          }
          @if (successMessage) {
            <div class="alert alert-success">{{ successMessage }}</div>
          }

          <form [formGroup]="productoForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nombre del producto</mat-label>
              <input matInput formControlName="nombre" placeholder="Ej. Pollo" />
              @if (productoForm.get('nombre')?.hasError('required') && productoForm.get('nombre')?.touched) {
                <mat-error>El nombre es obligatorio.</mat-error>
              }
              @if (productoForm.get('nombre')?.hasError('minlength') && productoForm.get('nombre')?.touched) {
                <mat-error>Mínimo 2 caracteres.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Precio (S/)</mat-label>
              <input matInput type="number" step="0.01" formControlName="precio" placeholder="0.00" />
              @if (productoForm.get('precio')?.hasError('required') && productoForm.get('precio')?.touched) {
                <mat-error>El precio es obligatorio.</mat-error>
              }
              @if (productoForm.get('precio')?.hasError('min') && productoForm.get('precio')?.touched) {
                <mat-error>El precio debe ser mayor a 0.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Stock</mat-label>
              <input matInput type="number" formControlName="stock" placeholder="Cantidad" />
              @if (productoForm.get('stock')?.hasError('required') && productoForm.get('stock')?.touched) {
                <mat-error>El stock es obligatorio.</mat-error>
              }
              @if (productoForm.get('stock')?.hasError('min') && productoForm.get('stock')?.touched) {
                <mat-error>El stock no puede ser negativo.</mat-error>
              }
            </mat-form-field>

            <div class="form-actions">
              <button mat-stroked-button type="button" routerLink="/productos">Cancelar</button>
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="productoForm.invalid || isLoading"
              >
                @if (isLoading) {
                  <mat-spinner diameter="20" />
                } @else {
                  {{ isEdit ? 'Actualizar' : 'Guardar' }} Producto
                }
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .form-page {
        max-width: 600px;
        margin: 0 auto;
      }
      .back-link {
        margin-bottom: 1rem;
      }
      .form-card {
        border-radius: 16px;
        padding: 1rem;
      }
      .full-width {
        width: 100%;
        margin-bottom: 0.5rem;
      }
      .form-actions {
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
        margin-top: 1rem;
      }
      .alert-error, .alert-success {
        padding: 0.75rem 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        font-size: 0.85rem;
      }
      .alert-error { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
      .alert-success { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
    `,
  ],
})
export class ProductoFormComponent implements OnInit {
  productoForm: FormGroup;
  isEdit = false;
  productoId: number | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.productoId = Number(idParam);
    }
  }

  onSubmit(): void {
    if (this.productoForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.productoService.guardar(this.productoForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = '¡Producto guardado exitosamente!';
        this.productoForm.reset({ nombre: '', precio: 0, stock: 0 });
        setTimeout(() => this.router.navigate(['/productos']), 1500);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Error al guardar el producto. Intenta de nuevo.';
      },
    });
  }
}
