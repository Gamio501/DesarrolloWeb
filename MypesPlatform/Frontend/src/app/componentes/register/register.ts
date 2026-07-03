import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../servicios/auth';
import { TiendaService } from '../../servicios/tienda';
import { Register as RegisterRequest } from '../../modelos/register';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {

  registerForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    rol: new FormControl('CLIENTE', Validators.required),
    // campos de tienda (solo requeridos si rol = ADMIN)
    nombreTienda: new FormControl(''),
    direccion: new FormControl(''),
    telefono: new FormControl('')
  });

  get rolSeleccionado(): string {
    return this.registerForm.get('rol')?.value ?? 'CLIENTE';
  }

  constructor(private auth: Auth, private tiendaService: TiendaService, private router: Router) { }

  enviarDatos(): void {

    if (this.registerForm.invalid) {
      return;
    }

    const datos = this.registerForm.value;
    const peticionRegistro: RegisterRequest = {
      username: datos.username!,
      password: datos.password!,
      rol: datos.rol!
    };

    // Si es ADMIN: registro → login automático → crear tienda
    if (datos.rol === 'ADMIN') {
      this.auth.register(peticionRegistro).pipe(
        switchMap((registroResp) => {
          // guardamos el usuarioId para usarlo al crear la tienda
          return this.auth.login({ username: datos.username!, password: datos.password! }).pipe(
            switchMap((loginResp) => {
              this.auth.guardarSesion(loginResp.token, loginResp.rol);
              return this.tiendaService.crearTienda({
                nombre: datos.nombreTienda!,
                direccion: datos.direccion!,
                telefono: datos.telefono!,
                usuarioId: registroResp.usuarioId
              });
            })
          );
        })
      ).subscribe({
        next: () => {
          this.router.navigate(['/mi-tienda']);
        },
        error: (error) => {
          console.error('Error en el proceso de registro de tienda', error);
        }
      });

    } else {
      // Si es CLIENTE: solo registro, luego al login
      this.auth.register(peticionRegistro).subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Error al registrarse', error);
        }
      });
    }
  }
}
