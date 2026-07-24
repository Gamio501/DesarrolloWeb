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
            System.out.println("Cargando modelo Vosk desde: " + modelPath);
            this.model = new Model(modelPath);
            System.out.println("Modelo Vosk cargado correctamente.");
        } catch (Exception e) {
            System.err.println("Error al cargar el modelo Vosk: " + e.getMessage());
            e.printStackTrace();
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
