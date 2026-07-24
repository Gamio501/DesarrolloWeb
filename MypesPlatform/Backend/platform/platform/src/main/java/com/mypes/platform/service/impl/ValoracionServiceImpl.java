package com.mypes.platform.service.impl;

import com.mypes.platform.dto.ValoracionDTO;
import com.mypes.platform.entity.Tienda;
import com.mypes.platform.entity.Usuario;
import com.mypes.platform.entity.Valoracion;
import com.mypes.platform.repository.TiendaRepository;
import com.mypes.platform.repository.UsuarioRepository;
import com.mypes.platform.repository.ValoracionRepository;
import com.mypes.platform.service.ValoracionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ValoracionServiceImpl implements ValoracionService {

    private final ValoracionRepository valoracionRepository;
    private final TiendaRepository tiendaRepository;
    private final UsuarioRepository usuarioRepository;

    public ValoracionServiceImpl(ValoracionRepository valoracionRepository,
                                 TiendaRepository tiendaRepository,
                                 UsuarioRepository usuarioRepository) {
        this.valoracionRepository = valoracionRepository;
        this.tiendaRepository = tiendaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    @Transactional
    public ValoracionDTO guardar(Long tiendaId, ValoracionDTO dto, String username) {
        Tienda tienda = tiendaRepository.findById(tiendaId)
                .orElseThrow(() -> new RuntimeException("Tienda no encontrada con ID: " + tiendaId));
        
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + username));

        int estrellas = (dto.getEstrellas() != null && dto.getEstrellas() >= 1 && dto.getEstrellas() <= 5)
                ? dto.getEstrellas() : 5;

        Valoracion val = Valoracion.builder()
                .tienda(tienda)
                .usuario(usuario)
                .estrellas(estrellas)
                .comentario(dto.getComentario())
                .fecha(LocalDateTime.now())
                .build();

        Valoracion guardada = valoracionRepository.save(val);

        return ValoracionDTO.builder()
                .valoracionId(guardada.getValoracionId())
                .estrellas(guardada.getEstrellas())
                .comentario(guardada.getComentario())
                .fecha(guardada.getFecha())
                .tiendaId(tienda.getTiendaId())
                .usuarioId(usuario.getUsuarioId())
                .usuarioNombre(usuario.getUsername())
                .build();
    }

    @Override
    public List<ValoracionDTO> obtenerPorTienda(Long tiendaId) {
        List<Valoracion> lista = valoracionRepository.findByTienda_TiendaIdOrderByFechaDesc(tiendaId);
        List<ValoracionDTO> dtos = new ArrayList<>();
        for (Valoracion v : lista) {
            dtos.add(ValoracionDTO.builder()
                    .valoracionId(v.getValoracionId())
                    .estrellas(v.getEstrellas())
                    .comentario(v.getComentario())
                    .fecha(v.getFecha())
                    .tiendaId(v.getTienda().getTiendaId())
                    .usuarioId(v.getUsuario().getUsuarioId())
                    .usuarioNombre(v.getUsuario().getUsername())
                    .build());
        }
        return dtos;
    }

    @Override
    public Double obtenerPromedio(Long tiendaId) {
        Double prom = valoracionRepository.calcularPromedioByTiendaId(tiendaId);
        return prom != null ? Math.round(prom * 10.0) / 10.0 : 5.0;
    }

    @Override
    public Integer obtenerTotal(Long tiendaId) {
        Integer total = valoracionRepository.contarValoracionesByTiendaId(tiendaId);
        return total != null ? total : 0;
    }
}
