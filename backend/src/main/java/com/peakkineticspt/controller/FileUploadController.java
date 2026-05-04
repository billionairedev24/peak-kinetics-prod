package com.peakkineticspt.controller;

import com.peakkineticspt.service.impl.LocalStorageService;
import com.peakkineticspt.service.impl.R2StorageService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
@Slf4j
public class FileUploadController {

    private final LocalStorageService localStorage;

    @Autowired(required = false)
    private R2StorageService r2;

    /** Direct multipart upload — kept for backward compat. Prefer the presigned flow. */
    @PostMapping
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) throws IOException {
        String url = (r2 != null && r2.isConfigured()) ? r2.storeFile(file) : localStorage.storeFile(file);
        return ResponseEntity.ok(Map.of(
                "url", url,
                "name", String.valueOf(file.getOriginalFilename()),
                "size", file.getSize()));
    }

    /** Issue a presigned PUT URL so the browser uploads bytes direct to R2. */
    @PostMapping("/presign")
    public ResponseEntity<?> presign(@RequestBody PresignRequest req) {
        if (r2 == null || !r2.isConfigured()) {
            return ResponseEntity.status(503).body(Map.of(
                    "error", "R2 not configured; use /api/upload (multipart) for local fallback."));
        }
        Map<String, String> signed = r2.presignPut(req.filename(), req.contentType(), Duration.ofMinutes(10));
        return ResponseEntity.ok(signed);
    }

    public record PresignRequest(@NotBlank String filename, String contentType) {}
}
