import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

import { LoginRequest, RegisterRequest, AuthResponse, RegisterResponse } from '../models/auth.models';

const API_URL = 'http://localhost:8880';
const TOKEN_KEY = 'jwt_token';

interface JwtPayload {
  sub: string;
  roles?: string[];
  role?: string;
  exp: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _isLoggedIn = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this._isLoggedIn.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Autentica al usuario contra POST /auth/login
   * Guarda el JWT en localStorage al recibir respuesta exitosa.
   */
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}/auth/login`, request).pipe(
      tap((response) => {
        localStorage.setItem(TOKEN_KEY, response.token);
        this._isLoggedIn.next(true);
      })
    );
  }

  /**
   * Registra un nuevo usuario contra POST /auth/register
   */
  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${API_URL}/auth/register`, request);
  }

  /**
   * Cierra sesión: elimina el token y redirige al login
   */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this._isLoggedIn.next(false);
    this.router.navigate(['/login']);
  }

  /**
   * Retorna true si hay un token válido (no expirado) en localStorage
   */
  hasToken(): boolean {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;
    try {
      const payload = jwtDecode<JwtPayload>(token);
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  /**
   * Retorna el rol del usuario decodificando el JWT
   */
  getRole(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      const payload = jwtDecode<JwtPayload>(token);
      if (payload.roles && payload.roles.length > 0) return payload.roles[0];
      if (payload.role) return payload.role;
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Retorna el username del token JWT
   */
  getUsername(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      const payload = jwtDecode<JwtPayload>(token);
      return payload.sub;
    } catch {
      return null;
    }
  }

  /**
   * Verifica si el usuario actual es ADMIN
   */
  isAdmin(): boolean {
    const role = this.getRole();
    return role === 'ROLE_ADMIN' || role === 'ADMIN';
  }
}
