package com.kpi.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web Configuration for serving uploaded files.
 * 
 * This configures Spring Boot to serve files from a local directory
 * as static resources. This allows the frontend to access uploaded
 * files via URL.
 * 
 * @author KPI System
 * @version 1.0
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * The directory where uploaded files will be stored.
     * This is set in application.properties.
     */
    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    /**
     * Configure resource handlers to serve uploaded files.
     * 
     * This maps the URL pattern /uploads/** to the local filesystem
     * directory where files are stored.
     * 
     * Example: http://localhost:8080/uploads/filename.pdf
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Add resource handler for /uploads/** URL pattern
        registry.addResourceHandler("/uploads/**")
                // Point to the upload directory on the filesystem
                .addResourceLocations("file:" + uploadDir + "/");
    }
}
