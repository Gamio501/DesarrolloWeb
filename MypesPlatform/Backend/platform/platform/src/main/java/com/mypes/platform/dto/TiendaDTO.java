package com.mypes.platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class TiendaDTO {

    private Long tiendaId;

    private String nombre;

    private String direccion;

    private String telefono;

    private Long usuarioId;

    private Double latitud;

    private Double longitud;


}
