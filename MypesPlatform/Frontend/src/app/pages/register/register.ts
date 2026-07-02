import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { TiendaService } from '../../core/services/tienda.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="register-wrapper">
      <mat-card class="register-card" appearance="outlined">
        <mat-card-header>
          <mat-card-title>Crear cuenta</mat-card-title>
          <mat-card-subtitle>
            Registra tu usuario y, si eres dueño de negocio, tu tienda en un solo paso.
          </mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          @if (errorMessage) {
            <div class="alert alert-error">{{ errorMessage }}</div>
          }
          @if (successMessage) {
            <div class="alert alert-success">{{ successMessage }}</div>
          }

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <fieldset class="form-section">
              <legend>Datos de usuario</legend>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Usuario</mat-label>
                <input matInput formControlName="username" placeholder="Nombre de usuario" autocomplete="username" />
                @if (registerForm.get('username')?.hasError('required') && registerForm.get('username')?.touched) {
                  <mat-error>El usuario es obligatorio.</mat-error>
                }
                @if (registerForm.get('username')?.hasError('minlength') && registerForm.get('username')?.touched) {
                  <mat-error>Mínimo 3 caracteres.</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Contraseña</mat-label>
                <input matInput type="password" formControlName="password" placeholder="Mínimo 4 caracteres" autocomplete="new-password" />
                @if (registerForm.get('password')?.hasError('required') && registerForm.get('password')?.touched) {
                  <mat-error>La contraseña es obligatoria.</mat-error>
                }
                @if (registerForm.get('password')?.hasError('minlength') && registerForm.get('password')?.touched) {
                  <mat-error>Mínimo 4 caracteres.</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Tipo de cuenta</mat-label>
                <mat-select formControlName="rol">
                  <mat-option value="CLIENTE">Cliente (comprar)</mat-option>
                  <mat-option value="ADMIN">Dueño de tienda (vender)</mat-option>
                </mat-select>
              </mat-form-field>
            </fieldset>

            @if (esAdmin) {
              <fieldset class="form-section fade-in">
                <legend>Datos de la tienda</legend>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Nombre de la tienda</mat-label>
                  <input matInput formControlName="nombreTienda" placeholder="Ej. Mi Bodega" />
                  @if (registerForm.get('nombreTienda')?.hasError('required') && registerForm.get('nombreTienda')?.touched) {
                    <mat-error>El nombre es obligatorio.</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Dirección</mat-label>
                  <input matInput formControlName="direccion" placeholder="Av. Principal 123" />
                  @if (registerForm.get('direccion')?.hasError('required') && registerForm.get('direccion')?.touched) {
                    <mat-error>La dirección es obligatoria.</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Teléfono</mat-label>
                  <input matInput formControlName="telefono" placeholder="999 999 999" />
                  @if (registerForm.get('telefono')?.hasError('required') && registerForm.get('telefono')?.touched) {
                    <mat-error>El teléfono es obligatorio.</mat-error>
                  }
                </mat-form-field>
              </fieldset>
            }

            <button
              mat-raised-button
              color="primary"
              type="submit"
              class="full-width"
              [disabled]="registerForm.invalid || isLoading"
            >
              @if (isLoading) {
                <mat-spinner diameter="20" />
              } @else {
                Registrarse
              }
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions align="end">
          <span class="form-hint">
            ¿Ya tienes cuenta?
            <a routerLink="/login">Iniciar sesión</a>
          </span>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .register-wrapper {
        display: flex;
        justify-content: center;
        padding: 2rem 1rem;
        min-height: calc(100vh - 140px);
      }
      .register-card {
        max-width: 520px;
        width: 100%;
        padding: 1.5rem;
        border-radius: 16px;
      }
      .full-width {
        width: 100%;
        margin-bottom: 0.25rem;
      }
      mat-card-title {
        font-size: 1.5rem;
        font-weight: 600;
        text-align: center;
        width: 100%;
      }
      mat-card-subtitle {
        text-align: center;
        margin-top: 0.25rem;
      }
      .form-section {
        border: 1px solid #e0e0e0;
        border-radius: 12px;
        padding: 1rem 1.25rem 0.25rem;
        margin-bottom: 1rem;
      }
      .form-section legend {
        font-weight: 600;
        padding: 0 0.5rem;
        font-size: 0.95rem;
        color: #333;
      }
      .form-hint {
        font-size: 0.85rem;
        color: #666;
      }
      .alert-error, .alert-success {
        padding: 0.75rem 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        font-size: 0.85rem;
      }
      .alert-error {
        background: #fef2f2;
        color: #991b1b;
        border: 1px solid #fecaca;
      }
      .alert-success {
        background: #f0fdf4;
        color: #166534;
        border: 1px solid #bbf7d0;
      }
      .fade-in {
        animation: fadeIn 0.25s ease;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-6px); }
        to { opacity: 1; transform: translateY(0); }
      }
      mat-card-actions {
        justify-content: center;
        padding-bottom: 1rem !important;
      }
    `,
  ],
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private tiendaService: TiendaService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      rol: ['CLIENTE', Validators.required],
      nombreTienda: [''],
      direccion: [''],
      telefono: [''],
    });

    this.registerForm.get('rol')?.valueChanges.subscribe((rol) => {
      const ctrl = ['nombreTienda', 'direccion', 'telefono'];
      if (rol === 'ADMIN') {
        ctrl.forEach((c) => this.registerForm.get(c)?.setValidators([Validators.required]));
      } else {
        ctrl.forEach((c) => this.registerForm.get(c)?.clearValidators());
      }
      ctrl.forEach((c) => this.registerForm.get(c)?.updateValueAndValidity());
    });
  }

  get esAdmin(): boolean {
    return this.registerForm.get('rol')?.value === 'ADMIN';
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { username, password, rol, nombreTienda, direccion, telefono } =
      this.registerForm.value;

    this.authService
      .register({ username, password, rol })
      .pipe(
        switchMap((regResp) =>
          this.authService.login({ username, password }).pipe(switchMap(() => of(regResp)))
        ),
        switchMap((regResp) => {
          if (rol !== 'ADMIN') return of(null);
          return this.tiendaService.guardar({
            nombre: nombreTienda,
            direccion,
            telefono,
            usuarioId: regResp.usuarioId,
          });
        })
      )
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Registro completado. Redirigiendo...';
          setTimeout(() => this.router.navigate(['/home']), 1200);
        },
        error: (err) => {
          this.isLoading = false;
          if (err.status === 409) this.errorMessage = 'El usuario ya existe.';
          else this.errorMessage = 'Error en el registro. Verifica los datos.';
        },
      });
  }
}
