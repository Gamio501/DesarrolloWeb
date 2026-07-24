import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem('token');
    
    let peticionClonada = request;
    if (token) {
      peticionClonada = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(peticionClonada).pipe(
      catchError((error: HttpErrorResponse) => {
        // Solo 401 significa token inválido/expirado. Un 403 con token presente
        // significa "autenticado pero sin permiso" (ej. CLIENTE en ruta ADMIN) —
        // no hay que destruir la sesión por eso.
        if (error.status === 401 && token) {
          console.warn('[AuthInterceptor] Token inválido o expirado. Redirigiendo a login.');
          localStorage.removeItem('token');
          localStorage.removeItem('rol');
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}