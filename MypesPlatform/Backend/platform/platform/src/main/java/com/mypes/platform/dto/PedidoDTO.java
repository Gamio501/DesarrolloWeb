package com.mypes.platform.dto;

import lombok.Data;

@Data
public class PedidoDTO {

    private Long pedidoId;
    private int cantidad;
    private String estado;
    private String estadoPedido;
    private Long usuarioId;

}
