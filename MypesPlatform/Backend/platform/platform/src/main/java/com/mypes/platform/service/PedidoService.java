package com.mypes.platform.service;

import java.util.List;

import com.mypes.platform.dto.PedidoDTO;
import com.mypes.platform.entity.Estado;

public interface PedidoService {

    PedidoDTO save(PedidoDTO dto);
    List<PedidoDTO> findAll();
    PedidoDTO findById(Long id);
    PedidoDTO updateStade(Long id, Estado estadoPedido);

}
