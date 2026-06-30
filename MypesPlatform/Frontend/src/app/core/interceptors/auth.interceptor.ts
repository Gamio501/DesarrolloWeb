import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor que agrega automáticamente el token JWT en el header Authorization
 * de todas las peticiones HTTP salientes cuando el usuario está autenticado.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('jwt_token');

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(authReq);
  }

  return next(req);
};
