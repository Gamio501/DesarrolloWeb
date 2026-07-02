// Mapea ProductoDTO.java del backend
export interface ProductoDTO {
  productoId?: number;
  nombre: string;
  precio: number;
  stock: number;
  tiendaId?: number;
  usuarioId?: number;
}

// Mapea TiendaDTO.java del backend
export interface TiendaDTO {
  tiendaId?: number;
  nombre: string;
  direccion: string;
  telefono: string;
  usuarioId?: number;
  latitud?: number;
  longitud?: number;
}
