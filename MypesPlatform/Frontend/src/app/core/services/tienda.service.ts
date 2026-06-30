import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { TiendaDTO } from '../models/platform.models';

const API_URL = 'http://localhost:8880';

@Injectable({
  providedIn: 'root',
})
export class TiendaService {
  constructor(private http: HttpClient) {}

  /**
   * Obtiene la tienda del admin autenticado - GET /tienda/mi-tienda (ADMIN)
   */
  miTienda(): Observable<TiendaDTO> {
    return this.http.get<TiendaDTO>(`${API_URL}/tienda/mi-tienda`);
  }

  /**
   * Obtiene TODAS las tiendas con lat/lng para el mapa - GET /tienda/todas (público)
   */
  findAll(): Observable<TiendaDTO[]> {
    return this.http.get<TiendaDTO[]>(`${API_URL}/tienda/todas`);
  }

  /**
   * Crea o actualiza la tienda - POST /tienda/guardar (ADMIN)
   */
  guardar(tienda: TiendaDTO): Observable<TiendaDTO> {
    return this.http.post<TiendaDTO>(`${API_URL}/tienda/guardar`, tienda);
  }
}

