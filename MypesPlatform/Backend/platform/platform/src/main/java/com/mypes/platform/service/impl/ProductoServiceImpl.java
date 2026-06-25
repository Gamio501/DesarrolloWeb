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
import com.mypes.platform.service.ProductoService;


@Service
public class ProductoServiceImpl implements ProductoService {



    private final ProductoRepository productoRepository;
    
    private final TiendaRepository tiendaRepository;

    private final UsuarioRepository usuarioRepository;

    public ProductoServiceImpl(
            ProductoRepository productoRepository,
            TiendaRepository tiendaRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.productoRepository = productoRepository;
        this.tiendaRepository = tiendaRepository;
        this.usuarioRepository = usuarioRepository;
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

        Producto producto = Producto.builder()
        .tienda(tienda)
        .usuario(usuario)
        .nombre(dto.getNombre())
        .precio(dto.getPrecio())
        .stock(dto.getStock())
        .build();
       
        Producto guardado = productoRepository.save(producto);


        ProductoDTO productoDTO = ProductoDTO.builder()
        .tiendaId(guardado.getTienda().getTiendaId())
        .usuarioId(guardado.getUsuario().getUsuarioId())
        .productoId(guardado.getProductoId())
        .nombre(guardado.getNombre())
        .precio(guardado.getPrecio())
        .stock(guardado.getStock())
        .build();       
        return productoDTO;
    }

    @Override
    public List<ProductoDTO> findAll() {
        
        List<Producto> listaProductos = productoRepository.findAll();

        List<ProductoDTO> respuesta = new ArrayList<>();

        for(Producto producto : listaProductos){
            ProductoDTO dto = ProductoDTO.builder()
            .productoId(producto.getProductoId())
            .tiendaId(producto.getTienda().getTiendaId())
            .usuarioId(producto.getUsuario() != null ? producto.getUsuario().getUsuarioId() : null)
            .nombre(producto.getNombre())
            .precio(producto.getPrecio())
            .stock(producto.getStock())
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
            respuesta.add(ProductoDTO.builder()
                    .productoId(producto.getProductoId())
                    .tiendaId(producto.getTienda().getTiendaId())
                    .nombre(producto.getNombre())
                    .precio(producto.getPrecio())
                    .stock(producto.getStock())
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
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'findById'");
    }

    @Override
    public void delete(Long id) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'delete'");
    }

    @Override
    public ProductoDTO update(ProductoDTO dto) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'update'");
    }



}
