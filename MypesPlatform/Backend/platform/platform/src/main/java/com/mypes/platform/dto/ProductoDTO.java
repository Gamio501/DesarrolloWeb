package com.mypes.platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductoDTO {

    private Long productoId;
    private String nombre;
    private double precio;
    private Integer stock;
    private Long tiendaId;
    private Long usuarioId;

}
