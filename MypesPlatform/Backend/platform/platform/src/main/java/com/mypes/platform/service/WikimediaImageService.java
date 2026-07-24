package com.mypes.platform.service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;

/**
 * Busca fotos stock en Wikimedia Commons por palabra clave (rubro de tienda o
 * nombre de producto) — no son fotos reales del local/producto, es una API
 * pública de búsqueda por keyword. Sin API key, sin registro, sin billing:
 * es la propia API de MediaWiki (misma infraestructura que Wikipedia),
 * pensada para uso público y gratuito indefinido.
 *
 * Parsea el JSON con regex en vez de una librería porque el proyecto tiene
 * dos versiones de Jackson en el classpath (Spring Boot 4 usa tools.jackson;
 * jjwt-jackson trae com.fasterxml.jackson 2.x transitivo) que chocan al
 * declarar una dependencia directa.
 */
@Service
public class WikimediaImageService {

    private static final String UPLOAD_DIR = "uploads";
    private static final Pattern THUMB_URL = Pattern.compile("\"thumburl\":\"([^\"]+)\"");

    private final HttpClient httpClient = HttpClient.newHttpClient();

    /** Primer resultado, descargado y guardado localmente. Usado al crear tienda automáticamente. */
    public String buscarFotoTienda(String nombreTienda) {
        List<String> candidatos = buscarCandidatos("tienda comercio " + nombreTienda, 1);
        if (candidatos.isEmpty()) {
            return null;
        }
        try {
            return descargarYGuardar(candidatos.get(0));
        } catch (IOException | InterruptedException e) {
            return null;
        }
    }

    /** Primer resultado por nombre de producto, descargado y guardado localmente. */
    public String buscarFotoProducto(String nombreProducto) {
        List<String> candidatos = buscarCandidatos(nombreProducto, 1);
        if (candidatos.isEmpty()) {
            return null;
        }
        return descargarElegida(candidatos.get(0));
    }

    /** URLs de miniatura (sin descargar) para que el usuario elija una en una galería. */
    public List<String> buscarCandidatos(String query, int cantidad) {
        if (query == null || query.isBlank()) {
            return List.of();
        }

        try {
            String q = java.net.URLEncoder.encode(query, StandardCharsets.UTF_8);
            String url = "https://commons.wikimedia.org/w/api.php"
                    + "?action=query&generator=search&gsrnamespace=6"
                    + "&gsrsearch=" + q
                    + "&gsrlimit=" + Math.max(3, cantidad)
                    + "&prop=imageinfo&iiprop=url&iiurlwidth=300"
                    + "&format=json";

            HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                    .header("User-Agent", "MypesPlatform/1.0 (proyecto educativo)")
                    .GET().build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                return List.of();
            }

            List<String> resultados = new ArrayList<>();
            Matcher matcher = THUMB_URL.matcher(response.body());
            while (matcher.find() && resultados.size() < cantidad) {
                resultados.add(matcher.group(1).replace("\\/", "/"));
            }
            return resultados;

        } catch (IOException | InterruptedException e) {
            return List.of();
        }
    }

    /** Descarga una URL de imagen ya elegida por el usuario y la guarda local. Solo hosts de Wikimedia. */
    public String descargarElegida(String imageUrl) {
        if (imageUrl == null || !esHostWikimedia(imageUrl)) {
            return null;
        }
        try {
            return descargarYGuardar(imageUrl);
        } catch (IOException | InterruptedException e) {
            return null;
        }
    }

    private boolean esHostWikimedia(String url) {
        try {
            String host = URI.create(url).getHost();
            return host != null && host.endsWith("wikimedia.org");
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    private String descargarYGuardar(String imageUrl) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder(URI.create(imageUrl))
                .header("User-Agent", "MypesPlatform/1.0 (proyecto educativo)")
                .GET().build();
        HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());

        if (response.statusCode() != 200) {
            return null;
        }

        Files.createDirectories(Paths.get(UPLOAD_DIR));
        String nombreArchivo = UUID.randomUUID() + ".jpg";
        Path ruta = Paths.get(UPLOAD_DIR, nombreArchivo);
        Files.write(ruta, response.body());

        return "/uploads/" + nombreArchivo;
    }
}
