import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { Auth } from '../../servicios/auth';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, NgIf],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {

  constructor(public auth: Auth) { }

  cerrarSesion(): void {
    this.auth.logout();
  }

}
