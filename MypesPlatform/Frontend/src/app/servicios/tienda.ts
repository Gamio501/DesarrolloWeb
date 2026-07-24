import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Tienda } from '../modelos/tienda';
import { Producto } from '../modelos/producto';
import { Valoracion } from '../modelos/valoracion';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TiendaService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  listar(): Observable<Tienda[]> {
    return this.http.get<Tienda[]>(`${this.baseUrl}/api/tienda/listar`);
  }

  obtenerMiTienda(): Observable<Tienda> {
    return this.http.get<Tienda>(`${this.baseUrl}/api/tienda/mi-tienda`);
  }

  obtenerTiendaPorId(id: number): Observable<Tienda> {
    return this.http.get<Tienda>(`${this.baseUrl}/api/tienda/${id}`);
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

  subirImagen(archivo: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post<{ url: string }>(`${this.baseUrl}/api/imagen/subir`, formData);
  }

  actualizarProducto(id: number, producto: { nombre: string; precio: number; stock: number }): Observable<Producto> {
    return this.http.put<Producto>(`${this.baseUrl}/productos/${id}`, producto);
  }

  actualizarImagenProducto(id: number, imagenUrl: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/productos/${id}/imagen`, { imagenUrl });
  }

  actualizarImagenTienda(id: number, imagenUrl: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/tienda/${id}/imagen`, { imagenUrl });
  }

  buscarFotosStock(q: string): Observable<string[]> {
    const params = { q };
    return this.http.get<string[]>(`${this.baseUrl}/api/imagen/buscar`, { params });
  }

  elegirFotoStock(imageUrl: string): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(`${this.baseUrl}/api/imagen/desde-url`, { imageUrl });
  }

  buscarProductos(q: string): Observable<Producto[]> {
    const params = { q: q.trim() };
    return this.http.get<Producto[]>(`${this.baseUrl}/productos/buscar`, { params });
  }

  transcribirAudio(audioBlob: Blob): Observable<{ text: string }> {
    const formData = new FormData();
    formData.append('file', audioBlob, 'voice.wav');
    return this.http.post<{ text: string }>(`${this.baseUrl}/api/voice/transcribe`, formData);
  }

  guardarValoracion(tiendaId: number, valoracion: { estrellas: number; comentario: string }): Observable<Valoracion> {
    return this.http.post<Valoracion>(`${this.baseUrl}/api/tienda/${tiendaId}/valorar`, valoracion);
  }

  obtenerValoraciones(tiendaId: number): Observable<Valoracion[]> {
    return this.http.get<Valoracion[]>(`${this.baseUrl}/api/tienda/${tiendaId}/valoraciones`);
  }
}
