package com.mypes.platform.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.mypes.platform.dto.ProductoDTO;
import com.mypes.platform.entity.Producto;
import com.mypes.platform.entity.Tienda;
import com.mypes.platform.entity.Usuario;
import com.mypes.platform.repository.ProductoRepository;
import com.mypes.platform.repository.TiendaRepository;
import com.mypes.platform.repository.UsuarioRepository;
import com.mypes.platform.repository.ValoracionRepository;
import com.mypes.platform.service.ImagenUrlResolver;
import com.mypes.platform.service.ProductoService;

@Service
public class ProductoServiceImpl implements ProductoService {

    private final ProductoRepository productoRepository;
    private final TiendaRepository tiendaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ValoracionRepository valoracionRepository;
    private final ImagenUrlResolver imagenUrlResolver;

    public ProductoServiceImpl(
            ProductoRepository productoRepository,
            TiendaRepository tiendaRepository,
            UsuarioRepository usuarioRepository,
            ValoracionRepository valoracionRepository,
            ImagenUrlResolver imagenUrlResolver) {
        this.productoRepository = productoRepository;
        this.tiendaRepository = tiendaRepository;
        this.usuarioRepository = usuarioRepository;
        this.valoracionRepository = valoracionRepository;
        this.imagenUrlResolver = imagenUrlResolver;
    }

    @Override
    public ProductoDTO save(ProductoDTO dto) {

        if (!esAdmin()) {
            throw new RuntimeException("Solo ADMIN puede agregar productos");
        }

        validarDatos(dto);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Tienda tienda = tiendaRepository.findByUsuario(usuario)
                .orElseThrow(() -> new RuntimeException("El usuario no tiene tienda asignada"));

        Producto producto = Producto.builder()
                .tienda(tienda)
                .usuario(usuario)
                .nombre(dto.getNombre())
                .precio(dto.getPrecio())
                .stock(dto.getStock())
                .imagenUrl(dto.getImagenUrl())
                .build();

        Producto guardado = productoRepository.save(producto);

        return aDto(guardado);
    }

    @Override
    public List<ProductoDTO> findAll() {
        List<Producto> listaProductos = productoRepository.findAll();
        List<ProductoDTO> respuesta = new ArrayList<>();
        for (Producto producto : listaProductos) {
            respuesta.add(aDto(producto));
        }
        return respuesta;
    }

    @Override
    public List<ProductoDTO> findByTiendaId(Long tiendaId) {
        List<Producto> listaProductos = productoRepository.findByTienda_TiendaId(tiendaId);
        List<ProductoDTO> respuesta = new ArrayList<>();
        for (Producto producto : listaProductos) {
            respuesta.add(aDto(producto));
        }
        return respuesta;
    }

    @Override
    public List<ProductoDTO> findMisProductos() {
        if (!esAdmin()) {
            throw new RuntimeException("Solo ADMIN puede ver sus productos");
        }

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Tienda tienda = tiendaRepository.findByUsuario(usuario)
                .orElseThrow(() -> new RuntimeException("El usuario no tiene tienda asignada"));

        return findByTiendaId(tienda.getTiendaId());
    }

    @Override
    public ProductoDTO findById(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));
        return aDto(producto);
    }

    @Override
    public void delete(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));

        validarPropietario(producto);

        productoRepository.delete(producto);
    }

    @Override
    public ProductoDTO update(ProductoDTO dto) {
        if (dto.getProductoId() == null) {
            throw new RuntimeException("productoId es requerido para actualizar");
        }

        Producto producto = productoRepository.findById(dto.getProductoId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + dto.getProductoId()));

        validarPropietario(producto);
        validarDatos(dto);

        producto.setNombre(dto.getNombre());
        producto.setPrecio(dto.getPrecio());
        producto.setStock(dto.getStock());
        if (dto.getImagenUrl() != null) {
            producto.setImagenUrl(dto.getImagenUrl());
        }

        Producto guardado = productoRepository.save(producto);
        return aDto(guardado);
    }

    @Override
    public ProductoDTO actualizarImagen(Long id, String imagenUrl) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));

        validarPropietario(producto);

        producto.setImagenUrl(imagenUrl);
        Producto guardado = productoRepository.save(producto);
        return aDto(guardado);
    }

    @Override
    public List<ProductoDTO> buscarPorNombre(String q) {
        if (q == null || q.trim().isEmpty()) {
            return new ArrayList<>();
        }
        List<Producto> listaProductos = productoRepository.buscarPorNombre(q.trim());
        List<ProductoDTO> respuesta = new ArrayList<>();
        for (Producto producto : listaProductos) {
            respuesta.add(aDto(producto));
        }
        return respuesta;
    }

    private ProductoDTO aDto(Producto producto) {
        Double prom = valoracionRepository.calcularPromedioByTiendaId(producto.getTienda().getTiendaId());
        return ProductoDTO.builder()
                .productoId(producto.getProductoId())
                .tiendaId(producto.getTienda().getTiendaId())
                .usuarioId(producto.getUsuario() != null ? producto.getUsuario().getUsuarioId() : null)
                .nombre(producto.getNombre())
                .precio(producto.getPrecio())
                .stock(producto.getStock())
                .imagenUrl(imagenUrlResolver.completar(producto.getImagenUrl()))
                .tiendaNombre(producto.getTienda().getNombre())
                .tiendaPromedioValoracion(prom != null ? Math.round(prom * 10.0) / 10.0 : 5.0)
                .build();
    }

    private void validarDatos(ProductoDTO dto) {
        if (dto.getPrecio() < 0) {
            throw new RuntimeException("El precio no puede ser negativo");
        }
        if (dto.getStock() < 0) {
            throw new RuntimeException("El stock no puede ser negativo");
        }
        if (dto.getNombre() == null || dto.getNombre().trim().isEmpty()) {
            throw new RuntimeException("El nombre no puede estar vacio");
        }
    }

    private void validarPropietario(Producto producto) {
        if (!esAdmin()) {
            throw new RuntimeException("Solo ADMIN puede modificar productos");
        }
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (producto.getUsuario() == null || !producto.getUsuario().getUsuarioId().equals(usuario.getUsuarioId())) {
            throw new RuntimeException("No puedes modificar un producto de otra tienda");
        }
    }

    private boolean esAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return false;
        }
        return auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }

}
