import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ProductoDTO } from '../models/platform.models';

const API_URL = 'http://localhost:8880';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  constructor(private http: HttpClient) {}

  /**
   * Lista todos los productos disponibles - GET /productos/listar (público)
   */
  listar(): Observable<ProductoDTO[]> {
    return this.http.get<ProductoDTO[]>(`${API_URL}/productos/listar`);
  }

  /**
   * Lista los productos de la tienda del admin autenticado - GET /productos/mi-tienda (ADMIN)
   */
  misProductos(): Observable<ProductoDTO[]> {
    return this.http.get<ProductoDTO[]>(`${API_URL}/productos/mi-tienda`);
  }

  /**
   * Guarda un nuevo producto - POST /productos/guardar (ADMIN)
   */
  guardar(producto: ProductoDTO): Observable<ProductoDTO> {
    return this.http.post<ProductoDTO>(`${API_URL}/productos/guardar`, producto);
  }
}
