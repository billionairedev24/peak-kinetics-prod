package com.peakkineticspt.controller;

import com.peakkineticspt.service.impl.UploadThingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
@Slf4j
public class FileUploadController {

    private final UploadThingService uploadThingService;

    @PostMapping
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        log.info("Received upload request for file: {}", file.getOriginalFilename());

        String fileUrl = uploadThingService.storeFile(file);

        log.info("File proxied to UploadThing successfully. URL: {}", fileUrl);

        return ResponseEntity.ok(Map.of(
                "url", fileUrl,
                "name", file.getOriginalFilename(),
                "size", file.getSize()));
    }
}
