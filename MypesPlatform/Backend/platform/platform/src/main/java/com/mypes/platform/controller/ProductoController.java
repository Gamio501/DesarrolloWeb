package com.mypes.platform.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mypes.platform.dto.ProductoDTO;
import com.mypes.platform.entity.Producto;
import com.mypes.platform.repository.ProductoRepository;
import com.mypes.platform.service.ProductoService;



@RestController
@RequestMapping("/productos")                                                                       
public class ProductoController {

    ProductoService productoService;
    ProductoRepository productoRepository;

    public ProductoController(ProductoService productoService, ProductoRepository productoRepository) {
        this.productoService = productoService;
        this.productoRepository = productoRepository;
    }


    @PostMapping("/guardar")
    public ProductoDTO guardarProducto(@RequestBody ProductoDTO dto) {
        ProductoDTO respuesta = productoService.save(dto);
        return respuesta;                              
    }

    @GetMapping("/check-admin")
    public ResponseEntity<String> checkAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean esAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        if (esAdmin) {
            return ResponseEntity.ok("ok");
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @GetMapping("/mi-tienda")
    public List<ProductoDTO> misProductos() {
        return productoService.findMisProductos();
    }

    @GetMapping("/listar")
    public List<ProductoDTO> listarProductos() {
        return productoService.findAll();
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<ProductoDTO>> buscarProductos(@RequestParam(value = "q", defaultValue = "") String q) {
        List<ProductoDTO> resultados = productoService.buscarPorNombre(q);
        return ResponseEntity.ok(resultados);
    }

    @PutMapping("/{id}/imagen")
    public ResponseEntity<?> actualizarImagen(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String imagenUrl = body.get("imagenUrl");
        if (imagenUrl == null || imagenUrl.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "imagenUrl es requerido"));
        }
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        producto.setImagenUrl(imagenUrl);
        productoRepository.save(producto);
        return ResponseEntity.ok(Map.of("imagenUrl", imagenUrl));
    }

}
