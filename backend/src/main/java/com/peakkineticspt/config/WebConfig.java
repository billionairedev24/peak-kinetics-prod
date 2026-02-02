package com.peakkineticspt.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

@Configuration
@Slf4j
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(org.springframework.web.servlet.config.annotation.CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
        registry.addMapping("/uploads/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "OPTIONS")
                .allowedHeaders("*");
    }

    @org.springframework.beans.factory.annotation.Value("${storage.upload-dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve local uploads
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDir + "/");

        // Serve _next static files with caching
        registry.addResourceHandler("/_next/**")
                .addResourceLocations("classpath:/static/_next/")
                .setCachePeriod(31536000)
                .resourceChain(true);

        // Serve other static assets
        registry.addResourceHandler("/images/**", "/*.ico", "/*.png", "/*.svg", "/*.txt", "/*.json")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(3600)
                .resourceChain(true);

        // Handle all other routes
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(0)
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        log.debug("Resolving resource path: {}", resourcePath);

                        // Don't handle API routes
                        if (resourcePath.startsWith("api/")) {
                            log.debug("Skipping API route: {}", resourcePath);
                            return null;
                        }

                        // Try to find the exact resource first
                        Resource requestedResource = location.createRelative(resourcePath);
                        if (requestedResource.exists() && requestedResource.isReadable()) {
                            log.debug("Found exact resource: {}", resourcePath);
                            return requestedResource;
                        }

                        // Try with /index.html appended (for routes like /admin/login)
                        String indexPath = resourcePath.endsWith("/") ? resourcePath + "index.html"
                                : resourcePath + "/index.html";
                        Resource indexResource = location.createRelative(indexPath);
                        if (indexResource.exists() && indexResource.isReadable()) {
                            log.debug("Found index resource: {}", indexPath);
                            return indexResource;
                        }

                        // Try with .html appended
                        Resource htmlResource = location.createRelative(resourcePath + ".html");
                        if (htmlResource.exists() && htmlResource.isReadable()) {
                            log.debug("Found HTML resource: {}.html", resourcePath);
                            return htmlResource;
                        }

                        // Fallback to root index.html
                        log.debug("Falling back to root index.html for: {}", resourcePath);
                        return new ClassPathResource("/static/index.html");
                    }
                });
    }
}