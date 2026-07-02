import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TiendaService } from '../../core/services/tienda.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  registerForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  step: 'register' | 'redirecting' = 'register';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private tiendaService: TiendaService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      rol: ['CLIENTE', [Validators.required]],
      nombreTienda: [''],
      direccion: [''],
      telefono: [''],
    });

    this.registerForm.get('rol')?.valueChanges.subscribe((rol) => {
      const controls = ['nombreTienda', 'direccion', 'telefono'];
      if (rol === 'ADMIN') {
        controls.forEach((c) => {
          this.registerForm.get(c)?.setValidators([Validators.required]);
          this.registerForm.get(c)?.enable();
        });
      } else {
        controls.forEach((c) => {
          this.registerForm.get(c)?.clearValidators();
          this.registerForm.get(c)?.disable();
        });
      }
      controls.forEach((c) => this.registerForm.get(c)?.updateValueAndValidity());
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
    this.step = 'register';

    const { username, password, rol, nombreTienda, direccion, telefono } =
      this.registerForm.value;

    // 1. Registrar usuario
    this.authService
      .register({ username, password, rol })
      .pipe(
        switchMap((regResp) => {
          // 2. Auto-login
          return this.authService
            .login({ username, password })
            .pipe(switchMap(() => of(regResp)));
        }),
        switchMap((regResp) => {
          // 3. Si es ADMIN, crear tienda
          if (rol !== 'ADMIN') return [undefined];
          return this.tiendaService.guardar({
            nombre: nombreTienda,
            direccion: direccion,
            telefono: telefono,
            usuarioId: regResp.usuarioId,
          });
        })
      )
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.step = 'redirecting';
          this.successMessage = 'Registro completado. Redirigiendo...';
          setTimeout(() => this.router.navigate(['/home']), 1200);
        },
        error: (err) => {
          this.isLoading = false;
          if (err.status === 409) {
            this.errorMessage = 'El usuario ya existe. Elige otro nombre.';
          } else if (err.status === 400 || err.status === 500) {
            this.errorMessage =
              err.error?.mensaje ||
              err.error?.message ||
              'Error en el registro. Verifica los datos.';
          } else {
            this.errorMessage =
              'Error al conectar con el servidor. Verifica que el backend esté corriendo.';
          }
        },
      });
  }
}
