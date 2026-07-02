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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
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
    <div class="login-wrapper">
      <mat-card class="login-card" appearance="outlined">
        <mat-card-header>
          <mat-card-title>Iniciar Sesión</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (errorMessage) {
            <div class="alert alert-error">{{ errorMessage }}</div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Usuario</mat-label>
              <input
                matInput
                formControlName="username"
                placeholder="Tu usuario"
                autocomplete="username"
              />
              @if (loginForm.get('username')?.hasError('required') && loginForm.get('username')?.touched) {
                <mat-error>El usuario es obligatorio.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <input
                matInput
                type="password"
                formControlName="password"
                placeholder="Tu contraseña"
                autocomplete="current-password"
              />
              @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
                <mat-error>La contraseña es obligatoria.</mat-error>
              }
              @if (loginForm.get('password')?.hasError('minlength') && loginForm.get('password')?.touched) {
                <mat-error>Mínimo 4 caracteres.</mat-error>
              }
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              class="full-width"
              [disabled]="loginForm.invalid || isLoading"
            >
              @if (isLoading) {
                <mat-spinner diameter="20" />
              } @else {
                Ingresar
              }
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions align="end">
          <span class="form-hint">
            ¿No tienes cuenta?
            <a routerLink="/register">Regístrate aquí</a>
          </span>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .login-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: calc(100vh - 140px);
        padding: 1rem;
      }
      .login-card {
        max-width: 400px;
        width: 100%;
        padding: 1rem;
        border-radius: 16px;
      }
      .full-width {
        width: 100%;
        margin-bottom: 0.5rem;
      }
      mat-card-title {
        font-size: 1.5rem;
        font-weight: 600;
        text-align: center;
        width: 100%;
        padding-top: 0.5rem;
      }
      .form-hint {
        font-size: 0.85rem;
        color: #666;
        width: 100%;
        text-align: center;
      }
      .alert-error {
        background: #fef2f2;
        color: #991b1b;
        border: 1px solid #fecaca;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        font-size: 0.85rem;
      }
      mat-card-actions {
        justify-content: center;
        padding-bottom: 1rem !important;
      }
    `,
  ],
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err.status === 401 || err.status === 403
            ? 'Usuario o contraseña incorrectos.'
            : 'Error al conectar con el servidor.';
      },
    });
  }
}
