package com.mypes.platform.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mypes.platform.service.PixabayService;

@RestController
@RequestMapping("/api/imagen")
public class ImagenController {

    private final PixabayService pixabayService;

    public ImagenController(PixabayService pixabayService) {
        this.pixabayService = pixabayService;
    }

    @GetMapping("/aleatoria")
    public Map<String, String> imagenAleatoria(@RequestParam(defaultValue = "tienda") String query) {
        String url = pixabayService.buscarImagen(query);
        return Map.of("url", url);
    }
}
