import { Component } from '@angular/core';
import { Login } from '../../modelos/login';
import { Auth } from '../../servicios/auth';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-formlogin',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './formlogin.html',
  styleUrl: './formlogin.scss',
})
export class Formlogin {


  loginForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });

  constructor(private auth: Auth, private router: Router) { }

  iniciarSesion(): void {

    if (this.loginForm.invalid) {
      return;
    }

    this.auth.login(this.loginForm.value as Login).subscribe({
      next: (respuesta) => {
        this.auth.guardarSesion(respuesta.token, respuesta.rol);
        if (respuesta.rol === 'ADMIN') {
          this.router.navigate(['/mi-tienda']);
        } else {
          this.router.navigate(['/buscar']);
        }
      },
      error: (error) => {
        console.error('Error al iniciar sesion', error);
      }
    });
  }
}
