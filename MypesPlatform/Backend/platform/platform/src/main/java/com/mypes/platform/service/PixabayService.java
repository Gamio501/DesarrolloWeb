package com.mypes.platform.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.mypes.platform.dto.PixabayResponse;

import jakarta.annotation.PostConstruct;

@Service
public class PixabayService {

    @Value("${pixabay.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public PixabayService() {
        this.restTemplate = new RestTemplate();
    }

    public String buscarImagen(String query) {
        try {
            String encoded = URLEncoder.encode(query, StandardCharsets.UTF_8);
            String url = String.format(
                    "https://pixabay.com/api/?key=%s&q=%s&image_type=photo&per_page=3&safesearch=true",
                    apiKey, encoded);
            PixabayResponse response = restTemplate.getForObject(url, PixabayResponse.class);
            if (response != null && response.getHits() != null && !response.getHits().isEmpty()) {
                return response.getHits().get(0).getWebformatURL();
            }
        } catch (Exception e) {
        }
        String seed = query.trim().toLowerCase().replaceAll("\\s+", "-").replaceAll("[^a-z0-9-]", "");
        if (seed.isEmpty()) seed = "producto";
        return "https://picsum.photos/seed/" + seed + "/400/400";
    }
}
