package com.mypes.platform.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ImagenUrlResolver {

    @Value("${app.base-url}")
    private String baseUrl;

    public String completar(String url) {
        if (url != null && url.startsWith("/uploads/")) {
            return baseUrl + url;
        }
        return url;
    }
}
