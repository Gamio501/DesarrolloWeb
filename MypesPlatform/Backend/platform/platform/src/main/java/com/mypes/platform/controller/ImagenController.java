package com.mypes.platform.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/imagen")
public class ImagenController {

    private static final String UPLOAD_DIR = "uploads";

    @PostMapping("/subir")
    public ResponseEntity<Map<String, String>> subirImagen(
            @RequestParam("archivo") MultipartFile archivo,
            HttpServletRequest request) {
        if (archivo.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El archivo está vacío"));
        }

        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));

            String extension = obtenerExtension(archivo.getOriginalFilename());
            String nombreArchivo = UUID.randomUUID().toString() + extension;
            Path ruta = Paths.get(UPLOAD_DIR, nombreArchivo);
            Files.write(ruta, archivo.getBytes());

            String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
            String url = baseUrl + "/uploads/" + nombreArchivo;
            return ResponseEntity.ok(Map.of("url", url));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Error al guardar la imagen"));
        }
    }

    private String obtenerExtension(String nombreOriginal) {
        if (nombreOriginal == null || !nombreOriginal.contains(".")) {
            return ".jpg";
        }
        return nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
    }
}
