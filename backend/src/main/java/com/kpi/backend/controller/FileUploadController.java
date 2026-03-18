package com.kpi.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

/**
 * Controller for handling file uploads.
 * 
 * This controller provides endpoints to:
 * - Upload single files
 * - Get file information
 * - Delete files
 * 
 * Files are stored in a configurable directory on the server.
 * 
 * @author KPI System
 * @version 1.0
 */
@RestController
@RequestMapping("/api/uploads")
public class FileUploadController {

    /**
     * The directory where uploaded files will be stored.
     * Configured in application.properties with key: app.upload.dir
     * Default: ./uploads (relative to application working directory)
     */
    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    /**
     * Maximum file size allowed for upload (in MB).
     * Configured in application.properties.
     */
    @Value("${app.upload.max-size:10}")
    private int maxFileSizeMB;

    /**
     * Upload a single file.
     * 
     * POST /api/uploads
     * 
     * Request: multipart/form-data with file field
     * Response: JSON with file path and info
     * 
     * @param file The file to upload (from multipart form)
     * @return File information including URL path
     */
    @PostMapping
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        // Check if file is provided
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Please select a file to upload"));
        }

        // Check file size
        if (file.getSize() > maxFileSizeMB * 1024 * 1024) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "File size exceeds maximum of " + maxFileSizeMB + "MB"));
        }

        try {
            // Create upload directory if it doesn't exist
            File uploadDirFile = new File(uploadDir);
            if (!uploadDirFile.exists()) {
                uploadDirFile.mkdirs();
            }

            // Generate unique filename to prevent overwrites
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            
            // Create unique filename: timestamp + random number + extension
            String uniqueFilename = System.currentTimeMillis() + "_" 
                    + new Random().nextInt(10000) + extension;
            
            // Get absolute path
            Path filePath = Paths.get(uploadDir, uniqueFilename);
            
            // Save the file
            Files.copy(file.getInputStream(), filePath);
            
            // Return success response
            Map<String, Object> response = new HashMap<>();
            response.put("filename", uniqueFilename);
            response.put("originalFilename", originalFilename);
            response.put("filePath", "/uploads/" + uniqueFilename);
            response.put("fileSize", file.getSize());
            response.put("contentType", file.getContentType());
            
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            System.err.println("[FileUpload] Error uploading file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }

    /**
     * Get list of uploaded files.
     * 
     * GET /api/uploads
     * 
     * @return List of files in the upload directory
     */
    @GetMapping
    public ResponseEntity<?> getFiles() {
        try {
            File uploadDirFile = new File(uploadDir);
            
            if (!uploadDirFile.exists()) {
                return ResponseEntity.ok(Map.of("files", new ArrayList<>()));
            }

            // Get list of files
            File[] files = uploadDirFile.listFiles();
            List<Map<String, Object>> fileList = new ArrayList<>();
            
            if (files != null) {
                for (File file : files) {
                    if (file.isFile()) {
                        Map<String, Object> fileInfo = new HashMap<>();
                        fileInfo.put("filename", file.getName());
                        fileInfo.put("filePath", "/uploads/" + file.getName());
                        fileInfo.put("fileSize", file.length());
                        fileInfo.put("lastModified", file.lastModified());
                        fileList.add(fileInfo);
                    }
                }
            }

            return ResponseEntity.ok(Map.of("files", fileList));
            
        } catch (Exception e) {
            System.err.println("[FileUpload] Error listing files: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to list files"));
        }
    }

    /**
     * Delete a file.
     * 
     * DELETE /api/uploads/{filename}
     * 
     * @param filename The name of the file to delete
     * @return Success or error message
     */
    @DeleteMapping("/{filename}")
    public ResponseEntity<?> deleteFile(@PathVariable String filename) {
        try {
            // Prevent path traversal attacks
            // Only allow alphanumeric characters, dots, dashes, underscores
            if (!filename.matches("^[a-zA-Z0-9._-]+$")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid filename"));
            }

            Path filePath = Paths.get(uploadDir, filename);
            
            // Check if file exists
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }

            // Delete the file
            Files.delete(filePath);
            
            return ResponseEntity.ok(Map.of("message", "File deleted successfully"));
            
        } catch (IOException e) {
            System.err.println("[FileUpload] Error deleting file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete file"));
        }
    }

    /**
     * Check if file exists.
     * 
     * HEAD /api/uploads/{filename}
     * 
     * @param filename The filename to check
     * @return 200 OK if exists, 404 if not
     */
    @RequestMapping(value = "/{filename}", method = RequestMethod.HEAD)
    public ResponseEntity<?> checkFile(@PathVariable String filename) {
        try {
            // Prevent path traversal attacks
            if (!filename.matches("^[a-zA-Z0-9._-]+$")) {
                return ResponseEntity.badRequest().build();
            }

            Path filePath = Paths.get(uploadDir, filename);
            
            if (Files.exists(filePath)) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
