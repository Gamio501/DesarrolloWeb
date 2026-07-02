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
import { TiendaService } from '../../../core/services/tienda.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-tienda-form',
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
      <a mat-button routerLink="/tiendas" class="back-link">
        <mat-icon>arrow_back</mat-icon>
        Volver a tiendas
      </a>

      <mat-card class="form-card" appearance="outlined">
        <mat-card-header>
          <mat-card-title>Registrar Tienda</mat-card-title>
          <mat-card-subtitle>Completa los datos de tu negocio</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          @if (errorMessage) {
            <div class="alert alert-error">{{ errorMessage }}</div>
          }
          @if (successMessage) {
            <div class="alert alert-success">{{ successMessage }}</div>
          }

          <form [formGroup]="tiendaForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nombre de la tienda</mat-label>
              <input matInput formControlName="nombre" placeholder="Ej. Mi Bodega" />
              @if (tiendaForm.get('nombre')?.invalid && tiendaForm.get('nombre')?.touched) {
                <mat-error>El nombre es obligatorio.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Dirección</mat-label>
              <input matInput formControlName="direccion" placeholder="Av. Principal 123" />
              @if (tiendaForm.get('direccion')?.invalid && tiendaForm.get('direccion')?.touched) {
                <mat-error>La dirección es obligatoria.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Teléfono</mat-label>
              <input matInput formControlName="telefono" placeholder="999 999 999" />
              @if (tiendaForm.get('telefono')?.invalid && tiendaForm.get('telefono')?.touched) {
                <mat-error>El teléfono es obligatorio.</mat-error>
              }
            </mat-form-field>

            <div class="form-actions">
              <button mat-stroked-button type="button" routerLink="/tiendas">Cancelar</button>
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="tiendaForm.invalid || isLoading"
              >
                @if (isLoading) {
                  <mat-spinner diameter="20" />
                } @else {
                  Guardar Tienda
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
      .form-page { max-width: 600px; margin: 0 auto; }
      .back-link { margin-bottom: 1rem; }
      .form-card { border-radius: 16px; padding: 1rem; }
      .full-width { width: 100%; margin-bottom: 0.5rem; }
      .form-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1rem; }
      .alert-error, .alert-success {
        padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.85rem;
      }
      .alert-error { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
      .alert-success { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
    `,
  ],
})
export class TiendaFormComponent implements OnInit {
  tiendaForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private tiendaService: TiendaService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.tiendaForm = this.fb.group({
      nombre: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.tiendaService.findById(id).subscribe({
        next: (data) => this.tiendaForm.patchValue(data),
        error: () => {},
      });
    }
  }

  onSubmit(): void {
    if (this.tiendaForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.tiendaService
      .guardar({
        ...this.tiendaForm.value,
        usuarioId: undefined,
      })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Tienda registrada exitosamente.';
          setTimeout(() => this.router.navigate(['/tiendas']), 1500);
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = 'Error al guardar la tienda.';
        },
      });
  }
}
