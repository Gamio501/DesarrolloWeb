package com.mypes.platform.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ValoracionDTO {

    private Long valoracionId;
    private Integer estrellas;
    private String comentario;
    private LocalDateTime fecha;
    private Long tiendaId;
    private Long usuarioId;
    private String usuarioNombre;
}
