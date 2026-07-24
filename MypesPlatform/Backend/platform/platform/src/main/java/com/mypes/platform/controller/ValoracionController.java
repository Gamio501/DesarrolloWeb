package com.mypes.platform.controller;

import com.mypes.platform.dto.ValoracionDTO;
import com.mypes.platform.service.ValoracionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tienda")
public class ValoracionController {

    private final ValoracionService valoracionService;

    public ValoracionController(ValoracionService valoracionService) {
        this.valoracionService = valoracionService;
    }

    @PostMapping("/{tiendaId}/valorar")
    public ResponseEntity<ValoracionDTO> valorar(
            @PathVariable Long tiendaId,
            @RequestBody ValoracionDTO dto) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        ValoracionDTO guardada = valoracionService.guardar(tiendaId, dto, username);
        return ResponseEntity.ok(guardada);
    }

    @GetMapping("/{tiendaId}/valoraciones")
    public ResponseEntity<List<ValoracionDTO>> listarValoraciones(@PathVariable Long tiendaId) {
        List<ValoracionDTO> lista = valoracionService.obtenerPorTienda(tiendaId);
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{tiendaId}/promedio")
    public ResponseEntity<Double> obtenerPromedio(@PathVariable Long tiendaId) {
        Double prom = valoracionService.obtenerPromedio(tiendaId);
        return ResponseEntity.ok(prom);
    }
}
