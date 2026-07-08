package com.mypes.platform.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mypes.platform.dto.TiendaDTO;
import com.mypes.platform.entity.Tienda;
import com.mypes.platform.repository.TiendaRepository;
import com.mypes.platform.service.TiendaService;

@RestController
@RequestMapping("/api/tienda")
@CrossOrigin(origins = "http://localhost:4200")
public class TiendaController {

    private final TiendaService tiendaService;
    private final TiendaRepository tiendaRepository;

    public TiendaController(TiendaService tiendaService, TiendaRepository tiendaRepository) {
        this.tiendaService = tiendaService;
        this.tiendaRepository = tiendaRepository;
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

    @PutMapping("/{id}/imagen")
    public ResponseEntity<?> actualizarImagen(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String imagenUrl = body.get("imagenUrl");
        if (imagenUrl == null || imagenUrl.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "imagenUrl es requerido"));
        }
        Tienda tienda = tiendaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tienda no encontrada"));
        tienda.setImagenUrl(imagenUrl);
        tiendaRepository.save(tienda);
        return ResponseEntity.ok(Map.of("imagenUrl", imagenUrl));
    }
}
