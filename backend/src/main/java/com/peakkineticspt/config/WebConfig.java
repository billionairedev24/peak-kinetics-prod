package com.peakkineticspt.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;

@Configuration
@Slf4j
public class WebConfig implements WebMvcConfigurer {

    @Value("${cors.allowed-origins:https://peakkineticspt.com,https://www.peakkineticspt.com}")
    private String allowedOriginsCsv;

    @Value("${cors.allowed-origin-patterns:https://*.peakkineticspt.com,https://*.peak-kinetics-frontend.pages.dev}")
    private String allowedOriginPatternsCsv;

    @Value("${storage.upload-dir:uploads}")
    private String uploadDir;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        List<String> origins = Arrays.stream(allowedOriginsCsv.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();
        List<String> patterns = Arrays.stream(allowedOriginPatternsCsv.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();

        registry.addMapping("/api/**")
                .allowedOrigins(origins.toArray(new String[0]))
                .allowedOriginPatterns(patterns.toArray(new String[0]))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("X-Request-ID")
                .allowCredentials(true)
                .maxAge(3600);

        registry.addMapping("/uploads/**")
                .allowedOrigins(origins.toArray(new String[0]))
                .allowedOriginPatterns(patterns.toArray(new String[0]))
                .allowedMethods("GET", "OPTIONS")
                .maxAge(3600);

        registry.addMapping("/actuator/**")
                .allowedOrigins(origins.toArray(new String[0]))
                .allowedMethods("GET")
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDir + "/");
    }
}
