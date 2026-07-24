package com.mypes.platform.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mypes.platform.dto.ProductoDTO;
import com.mypes.platform.service.ProductoService;

@RestController
@RequestMapping("/productos")
public class ProductoController {

    ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
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
    public List<ProductoDTO> buscarProductos(@org.springframework.web.bind.annotation.RequestParam("q") String q) {
        return productoService.buscarPorNombre(q);
    }

    @GetMapping("/{id}")
    public ProductoDTO obtenerProducto(@PathVariable Long id) {
        return productoService.findById(id);
    }

    @PutMapping("/{id}")
    public ProductoDTO actualizarProducto(@PathVariable Long id, @RequestBody ProductoDTO dto) {
        dto.setProductoId(id);
        return productoService.update(dto);
    }

    @PutMapping("/{id}/imagen")
    public ResponseEntity<?> actualizarImagen(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String imagenUrl = body.get("imagenUrl");
        if (imagenUrl == null || imagenUrl.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "imagenUrl es requerido"));
        }
        return ResponseEntity.ok(productoService.actualizarImagen(id, imagenUrl));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarProducto(@PathVariable Long id) {
        productoService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
