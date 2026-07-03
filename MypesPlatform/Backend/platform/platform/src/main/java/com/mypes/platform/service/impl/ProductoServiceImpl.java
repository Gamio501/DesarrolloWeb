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
import com.mypes.platform.service.PixabayService;
import com.mypes.platform.service.ProductoService;


@Service
public class ProductoServiceImpl implements ProductoService {



    private final ProductoRepository productoRepository;
    
    private final TiendaRepository tiendaRepository;

    private final UsuarioRepository usuarioRepository;

    private final PixabayService pixabayService;

    public ProductoServiceImpl(
            ProductoRepository productoRepository,
            TiendaRepository tiendaRepository,
            UsuarioRepository usuarioRepository,
            PixabayService pixabayService
    ) {
        this.productoRepository = productoRepository;
        this.tiendaRepository = tiendaRepository;
        this.usuarioRepository = usuarioRepository;
        this.pixabayService = pixabayService;
    }

    @Override
    public ProductoDTO save(ProductoDTO dto) {

        if (!esAdmin()) {
            throw new RuntimeException("Solo ADMIN puede agregar productos");
        }

        if(dto.getPrecio() < 0){
        throw new RuntimeException("El precio no puede ser negativo");
        }

        if(dto.getStock() < 0){
            throw new RuntimeException("El stock no puede ser negativo");
            }

        if(dto.getNombre() == null || dto.getNombre().trim().isEmpty()){
            throw new RuntimeException("El nombre no puede estar vacio");
            }

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Tienda tienda = tiendaRepository.findByUsuario(usuario)
                .orElseThrow(() -> new RuntimeException("El usuario no tiene tienda asignada"));

        if (dto.getImagenUrl() == null || dto.getImagenUrl().isBlank()) {
            dto.setImagenUrl(generarUrlImagen(dto.getNombre()));
        }

        Producto producto = Producto.builder()
        .tienda(tienda)
        .usuario(usuario)
        .nombre(dto.getNombre())
        .precio(dto.getPrecio())
        .stock(dto.getStock())
        .imagenUrl(dto.getImagenUrl())
        .build();
       
        Producto guardado = productoRepository.save(producto);


        ProductoDTO productoDTO = ProductoDTO.builder()
        .tiendaId(guardado.getTienda().getTiendaId())
        .usuarioId(guardado.getUsuario().getUsuarioId())
        .productoId(guardado.getProductoId())
        .nombre(guardado.getNombre())
        .precio(guardado.getPrecio())
        .stock(guardado.getStock())
        .imagenUrl(guardado.getImagenUrl())
        .build();       
        return productoDTO;
    }

    @Override
    public List<ProductoDTO> findAll() {
        
        List<Producto> listaProductos = productoRepository.findAll();

        List<ProductoDTO> respuesta = new ArrayList<>();

        for(Producto producto : listaProductos){
            String imgUrl = producto.getImagenUrl();
            if (imgUrl == null || imgUrl.isBlank()) {
                imgUrl = generarUrlImagen(producto.getNombre());
            }
            ProductoDTO dto = ProductoDTO.builder()
            .productoId(producto.getProductoId())
            .tiendaId(producto.getTienda().getTiendaId())
            .usuarioId(producto.getUsuario() != null ? producto.getUsuario().getUsuarioId() : null)
            .nombre(producto.getNombre())
            .precio(producto.getPrecio())
            .stock(producto.getStock())
            .imagenUrl(imgUrl)
            .build();

         respuesta.add(dto);

        }

        return respuesta;
        
    }

    @Override
    public List<ProductoDTO> findByTiendaId(Long tiendaId) {

        List<Producto> listaProductos = productoRepository.findByTienda_TiendaId(tiendaId);
        List<ProductoDTO> respuesta = new ArrayList<>();

        for (Producto producto : listaProductos) {
            String imgUrl = producto.getImagenUrl();
            if (imgUrl == null || imgUrl.isBlank()) {
                imgUrl = generarUrlImagen(producto.getNombre());
            }
            respuesta.add(ProductoDTO.builder()
                    .productoId(producto.getProductoId())
                    .tiendaId(producto.getTienda().getTiendaId())
                    .nombre(producto.getNombre())
                    .precio(producto.getPrecio())
                    .stock(producto.getStock())
                    .imagenUrl(imgUrl)
                    .build());
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

    private boolean esAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return false;
        }
        return auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }

    @Override
    public ProductoDTO findById(Long id) {
        throw new UnsupportedOperationException("Unimplemented method 'findById'");
    }

    @Override
    public void delete(Long id) {
        throw new UnsupportedOperationException("Unimplemented method 'delete'");
    }

    @Override
    public ProductoDTO update(ProductoDTO dto) {
        throw new UnsupportedOperationException("Unimplemented method 'update'");
    }

    private String generarUrlImagen(String nombre) {
        return pixabayService.buscarImagen(nombre);
    }

}
