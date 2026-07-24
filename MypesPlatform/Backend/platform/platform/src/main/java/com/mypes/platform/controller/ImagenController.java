package com.mypes.platform.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.mypes.platform.service.WikimediaImageService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/imagen")
public class ImagenController {

    private static final String UPLOAD_DIR = "uploads";

    private final WikimediaImageService wikimediaImageService;

    public ImagenController(WikimediaImageService wikimediaImageService) {
        this.wikimediaImageService = wikimediaImageService;
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<String>> buscarImagenes(@RequestParam("q") String q) {
        return ResponseEntity.ok(wikimediaImageService.buscarCandidatos(q, 6));
    }

    @PostMapping("/desde-url")
    public ResponseEntity<Map<String, String>> descargarDesdeUrl(@RequestBody Map<String, String> body,
            HttpServletRequest request) {
        String imageUrl = body.get("imageUrl");
        String rutaLocal = wikimediaImageService.descargarElegida(imageUrl);

        if (rutaLocal == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "No se pudo descargar la imagen elegida"));
        }

        String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
        return ResponseEntity.ok(Map.of("url", baseUrl + rutaLocal));
    }

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
