package com.mypes.platform.controller;


import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mypes.platform.dto.TiendaDTO;
import com.mypes.platform.repository.TiendaRepository;
import com.mypes.platform.service.TiendaService;






@RestController
@RequestMapping("/api/tienda")
public class TiendaController {

    private final TiendaService tiendaService;

    public TiendaController(TiendaService tiendaService, TiendaRepository tiendaRepository) {
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
}
