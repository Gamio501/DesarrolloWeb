package com.mypes.platform.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.mypes.platform.service.SpeechTranscribeService;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/voice")
public class VoiceTranscribeController {

    private final SpeechTranscribeService speechTranscribeService;

    public VoiceTranscribeController(SpeechTranscribeService speechTranscribeService) {
        this.speechTranscribeService = speechTranscribeService;
    }

    @PostMapping("/transcribe")
    public ResponseEntity<Map<String, String>> transcribeAudio(@RequestParam("file") MultipartFile file) {
        Map<String, String> response = new HashMap<>();
        try {
            if (file.isEmpty()) {
                response.put("error", "El archivo de audio está vacío.");
                return ResponseEntity.badRequest().body(response);
            }

            byte[] audioBytes = file.getBytes();
            String transcription = speechTranscribeService.transcribe(audioBytes);
            
            response.put("text", transcription);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", "Error procesando el audio: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
