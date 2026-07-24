import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Login } from '../modelos/login';
import { Observable } from 'rxjs';
import { LoginResponse } from '../modelos/login-response';
import { Register } from '../modelos/register';
import { RegisterResponse } from '../modelos/register-response';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class Auth {

  private baseUrl = 'http://localhost:8880/auth';

  constructor(private http: HttpClient, private router: Router) { }

  login(login: Login): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, login);
  }

  register(register: Register): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/register`, register);
  }

  logout(): void {
    const token = localStorage.getItem('token');

    localStorage.removeItem('token');
    localStorage.removeItem('rol');

    if (token) {
      this.http.post(`${this.baseUrl}/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      }).subscribe({ error: () => {} });
    }

    // Recarga completa: garantiza que el navbar y toda la app arranquen
    // desde cero con localStorage ya limpio, sin depender de que el change
    // detection de Angular refresque a tiempo.
    window.location.href = '/login';
  }

  estaLogueado(): boolean {
    return !!localStorage.getItem('token');
  }

  guardarSesion(token: string, rol: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('rol', rol);
  }

  getRol(): string | null {
    return localStorage.getItem('rol');
  }

  esCliente(): boolean {
    return this.getRol() === 'CLIENTE';
  }

  esAdmin(): boolean {
    return this.getRol() === 'ADMIN';
  }
}
