export interface Valoracion {
    valoracionId?: number;
    estrellas: number;
    comentario: string;
    fecha?: string;
    tiendaId: number;
    usuarioId?: number;
    usuarioNombre?: string;
}
