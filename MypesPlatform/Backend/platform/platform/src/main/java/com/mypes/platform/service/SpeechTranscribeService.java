package com.mypes.platform.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.vosk.Model;
import org.vosk.Recognizer;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.io.BufferedInputStream;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Enumeration;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;
import javax.sound.sampled.AudioFormat;
import javax.sound.sampled.AudioInputStream;
import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.UnsupportedAudioFileException;

@Service
public class SpeechTranscribeService {

    @Value("${app.vosk.model-path}")
    private String modelPath;

    private Model model;

    @PostConstruct
    public void init() {
        try {
            Path resolvedPath = resolveModelPath();
            System.out.println("Cargando modelo Vosk desde: " + resolvedPath);
            this.model = new Model(resolvedPath.toString());
            System.out.println("Modelo Vosk cargado correctamente.");
        } catch (Exception e) {
            System.err.println("Error al cargar el modelo Vosk: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private Path resolveModelPath() throws IOException {
        Path fsPath = Path.of(modelPath);
        if (Files.isDirectory(fsPath)) {
            return fsPath;
        }

        String classpathResource = "models/" + Path.of(modelPath).getFileName();
        InputStream is = getClass().getClassLoader().getResourceAsStream(classpathResource);
        if (is == null) {
            throw new IOException("Modelo Vosk no encontrado en filesystem ni classpath: " + classpathResource);
        }
        is.close();

        Path tempDir = Files.createTempDirectory("vosk-model-");
        extractClasspathResource(classpathResource, tempDir);
        return tempDir.resolve(Path.of(modelPath).getFileName());
    }

    private void extractClasspathResource(String resourceBase, Path targetDir) throws IOException {
        URL url = getClass().getClassLoader().getResource(resourceBase);
        if (url == null) return;

        if (url.getProtocol().equals("jar")) {
            String jarPath = url.getPath().substring(5, url.getPath().indexOf("!"));
            jarPath = java.net.URLDecoder.decode(jarPath, "UTF-8");
            try (JarFile jar = new JarFile(jarPath)) {
                Enumeration<JarEntry> entries = jar.entries();
                while (entries.hasMoreElements()) {
                    JarEntry entry = entries.nextElement();
                    if (entry.getName().startsWith(resourceBase + "/")) {
                        Path entryPath = targetDir.resolve(entry.getName());
                        if (entry.isDirectory()) {
                            Files.createDirectories(entryPath);
                        } else {
                            Files.createDirectories(entryPath.getParent());
                            try (InputStream in = jar.getInputStream(entry)) {
                                Files.copy(in, entryPath, StandardCopyOption.REPLACE_EXISTING);
                            }
                        }
                    }
                }
            }
        } else {
            try {
            Path source = Path.of(url.toURI());
            if (Files.isDirectory(source)) {
                try (var stream = Files.walk(source)) {
                    stream.forEach(p -> {
                        try {
                            Path dest = targetDir.resolve(source.relativize(p));
                            if (Files.isDirectory(p)) {
                                Files.createDirectories(dest);
                            } else {
                                Files.createDirectories(dest.getParent());
                                Files.copy(p, dest, StandardCopyOption.REPLACE_EXISTING);
                            }
                        } catch (IOException e) {
                            throw new RuntimeException(e);
                        }
                    });
                }
            }
            } catch (URISyntaxException e) {
                throw new IOException("URI inválida para recurso classpath", e);
            }
        }
    }

    @PreDestroy
    public void destroy() {
        if (model != null) {
            model.close();
        }
    }

    public String transcribe(byte[] audioData) {
        if (model == null) {
            return "Error: El modelo de voz no está inicializado.";
        }

        try (InputStream bis = new ByteArrayInputStream(audioData);
             AudioInputStream ais = AudioSystem.getAudioInputStream(new BufferedInputStream(bis))) {
            
            AudioFormat format = ais.getFormat();
            float sampleRate = format.getSampleRate();
            
            try (Recognizer recognizer = new Recognizer(model, (int) sampleRate)) {
                byte[] buffer = new byte[4096];
                int bytesRead;
                while ((bytesRead = ais.read(buffer)) >= 0) {
                    recognizer.acceptWaveForm(buffer, bytesRead);
                }
                
                String jsonResult = recognizer.getFinalResult();
                return extractTextFromJson(jsonResult);
            }
        } catch (UnsupportedAudioFileException e) {
            System.err.println("Formato de audio no soportado por AudioInputStream: " + e.getMessage() + ". Intentando como PCM crudo...");
            return transcribeRawPcm(audioData);
        } catch (IOException e) {
            System.err.println("Error de E/S leyendo audio: " + e.getMessage());
            return "";
        }
    }

    private String transcribeRawPcm(byte[] audioData) {
        try (Recognizer recognizer = new Recognizer(model, 16000)) {
            recognizer.acceptWaveForm(audioData, audioData.length);
            String jsonResult = recognizer.getFinalResult();
            return extractTextFromJson(jsonResult);
        } catch (Exception e) {
            System.err.println("Error transcribiendo PCM crudo: " + e.getMessage());
            return "";
        }
    }

    private String extractTextFromJson(String json) {
        if (json == null) {
            return "";
        }
        int index = json.indexOf("\"text\"");
        if (index != -1) {
            int start = json.indexOf("\"", index + 6);
            if (start != -1) {
                int end = json.indexOf("\"", start + 1);
                if (end != -1) {
                    return json.substring(start + 1, end);
                }
            }
        }
        return "";
    }
}
