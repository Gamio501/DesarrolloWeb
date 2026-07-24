export interface Tienda {
    tiendaId: number;
    nombre: string;
    direccion: string;
    telefono: string;
    usuarioId: number;
    latitud?: number;
    longitud?: number;
    imagenUrl?: string;
    promedioValoracion?: number;
    totalValoraciones?: number;
}
