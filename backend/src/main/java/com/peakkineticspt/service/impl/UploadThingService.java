package com.peakkineticspt.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class UploadThingService {

    @Value("${uploadthing.token}")
    private String uploadthingApiKey;

    private final RestClient restClient;
    private static final String API_URL = "https://api.uploadthing.com/v6/uploadFiles";

    /**
     * Proxies a file upload to UploadThing using the minimal required headers.
     * Verified configuration:
     * - Endpoint: /v6/uploadFiles
     * - Header: x-uploadthing-api-key
     * - Content-Type: application/json
     */
    public String storeFile(MultipartFile file) {
        log.info("Proxying file to UploadThing using minimal headers: {}", file.getOriginalFilename());

        if (uploadthingApiKey == null || uploadthingApiKey.isBlank()) {
            throw new RuntimeException("UploadThing API Key is missing");
        }

        try {
            // Step 1: Request Presigned URL
            Map<String, Object> fileDef = new HashMap<>();
            fileDef.put("name", file.getOriginalFilename());
            fileDef.put("size", file.getSize());
            fileDef.put("type", file.getContentType());

            Map<String, Object> prepareRequest = new HashMap<>();
            prepareRequest.put("files", List.of(fileDef));
            prepareRequest.put("acl", "public-read");
            prepareRequest.put("metadata", null);
            prepareRequest.put("contentDisposition", "inline");

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.post()
                    .uri(API_URL)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("x-uploadthing-api-key", uploadthingApiKey)
                    .body(prepareRequest)
                    .retrieve()
                    .onStatus(status -> !status.is2xxSuccessful(), (request, resp) -> {
                        byte[] errorBytes = resp.getBody().readAllBytes();
                        String errorMsg = new String(errorBytes);
                        log.error("UploadThing API Error: Status={}, Body={}", resp.getStatusCode(), errorMsg);
                        throw new RuntimeException("Failed to prepare upload: " + errorMsg);
                    })
                    .body(Map.class);

            log.info("UploadThing v6 response: {}", response);

            if (response == null || !response.containsKey("data")) {
                throw new RuntimeException("Missing 'data' in response");
            }

            List<Map<String, Object>> dataList = (List<Map<String, Object>>) response.get("data");
            if (dataList == null || dataList.isEmpty())
                throw new RuntimeException("Empty data array");

            Map<String, Object> fileData = dataList.get(0);
            String storageUrl = (String) fileData.get("url");
            String fileKey = (String) fileData.get("key");
            Map<String, String> fields = (Map<String, String>) fileData.get("fields");

            // Step 2: Upload file bits to S3 (Multipart POST)
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            fields.forEach(builder::part);
            builder.part("file", file.getResource(), MediaType.parseMediaType(file.getContentType()))
                    .filename(file.getOriginalFilename());

            MultiValueMap<String, HttpEntity<?>> multipartBody = builder.build();

            restClient.post()
                    .uri(storageUrl)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(multipartBody)
                    .retrieve()
                    .onStatus(status -> !status.is2xxSuccessful(), (request, resp) -> {
                        log.error("Storage upload failed. Status: {}", resp.getStatusCode());
                        throw new RuntimeException("S3 Storage upload failed: " + resp.getStatusCode());
                    })
                    .toBodilessEntity();

            String finalUrl = "https://utfs.io/f/" + fileKey;
            log.info("Upload complete. Final URL: {}", finalUrl);
            return finalUrl;

        } catch (Exception e) {
            log.error("Error during UploadThing proxy upload, falling back to local storage", e);
            return saveFileLocally(file);
        }
    }

    @Value("${storage.upload-dir:uploads}")
    private String uploadDir;

    private String saveFileLocally(MultipartFile file) {
        try {
            java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir);
            if (!java.nio.file.Files.exists(uploadPath)) {
                java.nio.file.Files.createDirectories(uploadPath);
                log.info("Created uploads directory at: {}", uploadPath.toAbsolutePath());
            }

            String originalName = file.getOriginalFilename();
            String extension = "";
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }

            String fileName = System.currentTimeMillis() + "_" +
                    (originalName != null ? originalName.replaceAll("[^a-zA-Z0-9.-]", "_") : "upload") +
                    (originalName != null && originalName.endsWith(extension) ? "" : extension);

            java.nio.file.Path filePath = uploadPath.resolve(fileName);
            java.nio.file.Files.copy(file.getInputStream(), filePath,
                    java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            log.info("File saved locally as fallback: {}", filePath.toAbsolutePath());

            // Return absolute URL consistent with UploadThing
            return org.springframework.web.servlet.support.ServletUriComponentsBuilder
                    .fromCurrentContextPath()
                    .path("/uploads/")
                    .path(fileName)
                    .toUriString();
        } catch (java.io.IOException e) {
            log.error("Failed to save file locally during fallback", e);
            throw new RuntimeException("Both UploadThing and local storage failed", e);
        }
    }
}
