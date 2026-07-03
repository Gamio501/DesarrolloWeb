import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Tienda } from '../modelos/tienda';
import { Producto } from '../modelos/producto';

@Injectable({
  providedIn: 'root',
})
export class TiendaService {

  private baseUrl = 'http://localhost:8880';

  constructor(private http: HttpClient) { }

  listar(): Observable<Tienda[]> {
    return this.http.get<Tienda[]>(`${this.baseUrl}/api/tienda/listar`);
  }

  obtenerMiTienda(): Observable<Tienda> {
    return this.http.get<Tienda>(`${this.baseUrl}/api/tienda/mi-tienda`);
  }

  crearTienda(tienda: { nombre: string; direccion: string; telefono: string; usuarioId?: number }): Observable<Tienda> {
    return this.http.post<Tienda>(`${this.baseUrl}/api/tienda/guardar`, tienda);
  }

  obtenerProductosAdmin(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/productos/mi-tienda`);
  }

  agregarNuevosProductosAdmin(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(`${this.baseUrl}/productos/guardar`, producto);
  }

  obtenerProductosAll(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/productos/listar`);
  }

  obtenerImagenAleatoria(query: string): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.baseUrl}/api/imagen/aleatoria?query=${query}`);
  }

  actualizarImagenProducto(id: number, imagenUrl: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/productos/${id}/imagen`, { imagenUrl });
  }

  actualizarImagenTienda(id: number, imagenUrl: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/tienda/${id}/imagen`, { imagenUrl });
  }

}

