package com.mypes.platform.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.mypes.platform.dto.TiendaDTO;
import com.mypes.platform.entity.Tienda;
import com.mypes.platform.entity.Usuario;
import com.mypes.platform.repository.TiendaRepository;
import com.mypes.platform.repository.UsuarioRepository;
import com.mypes.platform.service.TiendaService;


@Service
public class TiendaServiceImpl implements TiendaService{


    TiendaRepository tiendaRepository;
    UsuarioRepository usuarioRepository;
                     

    public TiendaServiceImpl(TiendaRepository tiendaRepository, UsuarioRepository usuarioRepository) {
        this.tiendaRepository = tiendaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public TiendaDTO save(TiendaDTO dto) {

        if(dto.getNombre().isEmpty()){
            throw new RuntimeException("El nombre no puede estar vacio");                                                           
        }
        if(dto.getDireccion().isEmpty()){
            throw new RuntimeException("La direccion no puede estar vacia");
        }
        if(dto.getTelefono().isEmpty()){
            throw new RuntimeException("El telefono no puede estar vacio");
        }

        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
        .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        validarPropietario(usuario.getUsuarioId());

        Tienda tienda = Tienda.builder()
        .nombre(dto.getNombre())
        .direccion(dto.getDireccion())
        .telefono(dto.getTelefono())
        .latitud(dto.getLatitud())
        .longitud(dto.getLongitud())
        .usuario(usuario)
        .build();

        Tienda guardado = tiendaRepository.save(tienda);

        TiendaDTO tiendaDTO = TiendaDTO.builder()
        .tiendaId(guardado.getTiendaId())
        .nombre(guardado.getNombre())
        .direccion(guardado.getDireccion())
        .telefono(guardado.getTelefono())
        .latitud(guardado.getLatitud())
        .longitud(guardado.getLongitud())
        .usuarioId(guardado.getUsuario().getUsuarioId()) 
        .build();  
        
        TiendaDTO respuesta = tiendaDTO;
        return respuesta;
      
    }

    @Override
    public TiendaDTO findById(Long id) {
        Tienda tienda = tiendaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tienda no encontrada"));

        return TiendaDTO.builder()
                .tiendaId(tienda.getTiendaId())
                .nombre(tienda.getNombre())
                .direccion(tienda.getDireccion())
                .telefono(tienda.getTelefono())
                .latitud(tienda.getLatitud())
                .longitud(tienda.getLongitud())
                .build();
    }

    @Override
    public TiendaDTO update(TiendaDTO dto) {
        Tienda existente = tiendaRepository.findById(dto.getTiendaId())
                .orElseThrow(() -> new RuntimeException("Tienda no encontrada"));

        validarPropietario(existente.getUsuario().getUsuarioId());

        if (dto.getNombre() != null && !dto.getNombre().isEmpty())
            existente.setNombre(dto.getNombre());
        if (dto.getDireccion() != null && !dto.getDireccion().isEmpty())
            existente.setDireccion(dto.getDireccion());
        if (dto.getTelefono() != null && !dto.getTelefono().isEmpty())
            existente.setTelefono(dto.getTelefono());
        if (dto.getLatitud() != null)
            existente.setLatitud(dto.getLatitud());
        if (dto.getLongitud() != null)
            existente.setLongitud(dto.getLongitud());

        Tienda guardado = tiendaRepository.save(existente);

        return TiendaDTO.builder()
                .tiendaId(guardado.getTiendaId())
                .nombre(guardado.getNombre())
                .direccion(guardado.getDireccion())
                .telefono(guardado.getTelefono())
                .latitud(guardado.getLatitud())
                .longitud(guardado.getLongitud())
                .usuarioId(guardado.getUsuario().getUsuarioId())
                .build();
    }

    @Override
    public List<TiendaDTO> findAll() {

        List<Tienda> listaTiendas = tiendaRepository.findAll();
        List<TiendaDTO> respuesta = new ArrayList<>();

        for (Tienda tienda : listaTiendas) {
            respuesta.add(TiendaDTO.builder()
                    .tiendaId(tienda.getTiendaId())
                    .nombre(tienda.getNombre())
                    .direccion(tienda.getDireccion())
                    .telefono(tienda.getTelefono())
                    .latitud(tienda.getLatitud())
                    .longitud(tienda.getLongitud())
                    .build());
        }

        return respuesta;
    }

    @Override
    public TiendaDTO findByUsuarioId(Long usuarioId) {
        Tienda tienda = tiendaRepository.findByUsuario_UsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("Tienda no encontrada para el usuario"));

        return TiendaDTO.builder()
                .tiendaId(tienda.getTiendaId())
                .nombre(tienda.getNombre())
                .direccion(tienda.getDireccion())
                .telefono(tienda.getTelefono())
                .latitud(tienda.getLatitud())
                .longitud(tienda.getLongitud())
                .usuarioId(usuarioId)
                .build();
    }

    @Override
    public TiendaDTO findMiTienda() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return findByUsuarioId(usuario.getUsuarioId());
    }

    private void validarPropietario(Long usuarioIdTienda) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()
                || "anonymousUser".equals(auth.getPrincipal())) {
            return;
        }
        boolean esAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        if (!esAdmin) {
            return;
        }
        Usuario actual = usuarioRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        if (!actual.getUsuarioId().equals(usuarioIdTienda)) {
            throw new RuntimeException("No puedes gestionar la tienda de otro usuario");
        }
    }

}
