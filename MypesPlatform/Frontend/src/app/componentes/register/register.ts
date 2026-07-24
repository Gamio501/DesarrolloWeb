import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Auth } from '../../servicios/auth';
import { TiendaService } from '../../servicios/tienda';
import { Register as RegisterRequest } from '../../modelos/register';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { NgIf } from '@angular/common';

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

// OWASP: minimo 8 caracteres, mayuscula, minuscula, numero y caracter especial.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$/;

function passwordsCoinciden(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmarPassword = control.get('confirmarPassword')?.value;
  return password === confirmarPassword ? null : { passwordsNoCoinciden: true };
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {

  registerForm = new FormGroup({
    username: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.pattern(EMAIL_REGEX)]),
    password: new FormControl('', [Validators.required, Validators.pattern(PASSWORD_REGEX)]),
    confirmarPassword: new FormControl('', Validators.required),
    rol: new FormControl('CLIENTE', Validators.required),
    nombreTienda: new FormControl(''),
    direccion: new FormControl(''),
    telefono: new FormControl('')
  }, { validators: passwordsCoinciden });

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
      email: datos.email!,
      password: datos.password!,
      rol: datos.rol!
    };

    if (datos.rol === 'ADMIN') {
      this.auth.register(peticionRegistro).pipe(
        switchMap((registroResp) => {
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
