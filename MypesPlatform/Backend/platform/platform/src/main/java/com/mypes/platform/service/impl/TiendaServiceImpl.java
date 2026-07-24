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
import com.mypes.platform.repository.ValoracionRepository;
import com.mypes.platform.service.ImagenUrlResolver;
import com.mypes.platform.service.WikimediaImageService;
import com.mypes.platform.service.TiendaService;

@Service
public class TiendaServiceImpl implements TiendaService {

    private final TiendaRepository tiendaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ValoracionRepository valoracionRepository;
    private final ImagenUrlResolver imagenUrlResolver;
    private final WikimediaImageService wikimediaImageService;

    public TiendaServiceImpl(TiendaRepository tiendaRepository,
            UsuarioRepository usuarioRepository,
            ValoracionRepository valoracionRepository,
            ImagenUrlResolver imagenUrlResolver,
            WikimediaImageService wikimediaImageService) {
        this.tiendaRepository = tiendaRepository;
        this.usuarioRepository = usuarioRepository;
        this.valoracionRepository = valoracionRepository;
        this.imagenUrlResolver = imagenUrlResolver;
        this.wikimediaImageService = wikimediaImageService;
    }

    @Override
    public TiendaDTO save(TiendaDTO dto) {

        if (dto.getNombre().isEmpty()) {
            throw new RuntimeException("El nombre no puede estar vacio");
        }
        if (dto.getDireccion().isEmpty()) {
            throw new RuntimeException("La direccion no puede estar vacia");
        }
        if (dto.getTelefono().isEmpty()) {
            throw new RuntimeException("El telefono no puede estar vacio");
        }

        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        validarPropietario(usuario.getUsuarioId());

        String imagenUrl = dto.getImagenUrl();
        if (imagenUrl == null || imagenUrl.isBlank()) {
            imagenUrl = wikimediaImageService.buscarFotoTienda(dto.getNombre());
        }

        Tienda tienda = Tienda.builder()
                .nombre(dto.getNombre())
                .direccion(dto.getDireccion())
                .telefono(dto.getTelefono())
                .latitud(dto.getLatitud())
                .longitud(dto.getLongitud())
                .imagenUrl(imagenUrl)
                .usuario(usuario)
                .build();

        Tienda guardado = tiendaRepository.save(tienda);

        return aDto(guardado, null, null);
    }

    @Override
    public TiendaDTO findById(Long id) {
        Tienda tienda = tiendaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tienda no encontrada"));

        Double prom = valoracionRepository.calcularPromedioByTiendaId(tienda.getTiendaId());
        Integer total = valoracionRepository.contarValoracionesByTiendaId(tienda.getTiendaId());

        return aDto(tienda, prom, total);
    }

    @Override
    public TiendaDTO update(TiendaDTO dto) {
        if (dto.getTiendaId() == null) {
            throw new RuntimeException("tiendaId es requerido para actualizar");
        }

        Tienda tienda = tiendaRepository.findById(dto.getTiendaId())
                .orElseThrow(() -> new RuntimeException("Tienda no encontrada"));

        validarPropietario(tienda.getUsuario().getUsuarioId());

        if (dto.getNombre() == null || dto.getNombre().isBlank()) {
            throw new RuntimeException("El nombre no puede estar vacio");
        }
        if (dto.getDireccion() == null || dto.getDireccion().isBlank()) {
            throw new RuntimeException("La direccion no puede estar vacia");
        }
        if (dto.getTelefono() == null || dto.getTelefono().isBlank()) {
            throw new RuntimeException("El telefono no puede estar vacio");
        }

        tienda.setNombre(dto.getNombre());
        tienda.setDireccion(dto.getDireccion());
        tienda.setTelefono(dto.getTelefono());
        if (dto.getLatitud() != null) {
            tienda.setLatitud(dto.getLatitud());
        }
        if (dto.getLongitud() != null) {
            tienda.setLongitud(dto.getLongitud());
        }
        if (dto.getImagenUrl() != null) {
            tienda.setImagenUrl(dto.getImagenUrl());
        }

        Tienda guardado = tiendaRepository.save(tienda);
        return aDto(guardado, null, null);
    }

    @Override
    public TiendaDTO actualizarImagen(Long id, String imagenUrl) {
        Tienda tienda = tiendaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tienda no encontrada"));

        validarPropietario(tienda.getUsuario().getUsuarioId());

        tienda.setImagenUrl(imagenUrl);
        Tienda guardado = tiendaRepository.save(tienda);
        return aDto(guardado, null, null);
    }

    @Override
    public List<TiendaDTO> findAll() {
        List<Tienda> listaTiendas = tiendaRepository.findAll();
        List<TiendaDTO> respuesta = new ArrayList<>();

        for (Tienda tienda : listaTiendas) {
            Double prom = valoracionRepository.calcularPromedioByTiendaId(tienda.getTiendaId());
            Integer total = valoracionRepository.contarValoracionesByTiendaId(tienda.getTiendaId());
            respuesta.add(aDto(tienda, prom, total));
        }

        return respuesta;
    }

    @Override
    public TiendaDTO findByUsuarioId(Long usuarioId) {
        Tienda tienda = tiendaRepository.findByUsuario_UsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("Tienda no encontrada para el usuario"));

        return aDto(tienda, null, null);
    }

    @Override
    public TiendaDTO findMiTienda() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return findByUsuarioId(usuario.getUsuarioId());
    }

    private TiendaDTO aDto(Tienda tienda, Double prom, Integer total) {
        return TiendaDTO.builder()
                .tiendaId(tienda.getTiendaId())
                .nombre(tienda.getNombre())
                .direccion(tienda.getDireccion())
                .telefono(tienda.getTelefono())
                .usuarioId(tienda.getUsuario().getUsuarioId())
                .latitud(tienda.getLatitud())
                .longitud(tienda.getLongitud())
                .imagenUrl(imagenUrlResolver.completar(tienda.getImagenUrl()))
                .promedioValoracion(prom != null ? Math.round(prom * 10.0) / 10.0 : 5.0)
                .totalValoraciones(total != null ? total : 0)
                .build();
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
            throw new RuntimeException("Solo los dueños de tienda pueden registrar una tienda");
        }
        Usuario actual = usuarioRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        if (!actual.getUsuarioId().equals(usuarioIdTienda)) {
            throw new RuntimeException("No puedes gestionar la tienda de otro usuario");
        }
    }

}
