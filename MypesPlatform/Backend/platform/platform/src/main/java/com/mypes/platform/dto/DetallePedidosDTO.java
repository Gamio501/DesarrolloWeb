package com.mypes.platform.dto;

import lombok.Data;

@Data
public class DetallePedidosDTO {

    private Long detallespedidosId;
    private Integer cantidad;
    private Double precioUnitario;
    private Long pedidoId;
    private Long productoId;

    

}
