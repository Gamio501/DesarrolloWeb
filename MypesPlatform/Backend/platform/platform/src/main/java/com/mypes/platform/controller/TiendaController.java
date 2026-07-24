package com.mypes.platform.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mypes.platform.dto.TiendaDTO;
import com.mypes.platform.service.TiendaService;

@RestController
@RequestMapping("/api/tienda")
public class TiendaController {

    private final TiendaService tiendaService;

    public TiendaController(TiendaService tiendaService) {
        this.tiendaService = tiendaService;
    }

    @GetMapping("/mi-tienda")
    public TiendaDTO miTienda() {
        return tiendaService.findMiTienda();
    }

    @PostMapping("/guardar")
    public TiendaDTO crearTienda(@RequestBody TiendaDTO dto) {
        TiendaDTO respuesta = tiendaService.save(dto);
        return respuesta;
    }

    @GetMapping("/listar")
    public List<TiendaDTO> listarTiendas() {
        return tiendaService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TiendaDTO> obtenerTienda(@PathVariable Long id) {
        return ResponseEntity.ok(tiendaService.findById(id));
    }

    @PutMapping("/{id}")
    public TiendaDTO actualizarTienda(@PathVariable Long id, @RequestBody TiendaDTO dto) {
        dto.setTiendaId(id);
        return tiendaService.update(dto);
    }

    @PutMapping("/{id}/imagen")
    public ResponseEntity<?> actualizarImagen(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String imagenUrl = body.get("imagenUrl");
        if (imagenUrl == null || imagenUrl.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "imagenUrl es requerido"));
        }
        return ResponseEntity.ok(tiendaService.actualizarImagen(id, imagenUrl));
    }
}
