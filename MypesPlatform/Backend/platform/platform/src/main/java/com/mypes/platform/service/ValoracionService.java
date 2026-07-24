package com.mypes.platform.service;

import com.mypes.platform.dto.ValoracionDTO;
import java.util.List;

public interface ValoracionService {
    ValoracionDTO guardar(Long tiendaId, ValoracionDTO dto, String username);
    List<ValoracionDTO> obtenerPorTienda(Long tiendaId);
    Double obtenerPromedio(Long tiendaId);
    Integer obtenerTotal(Long tiendaId);
}
