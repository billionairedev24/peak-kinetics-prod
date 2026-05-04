package com.peakkineticspt.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.io.IOException;
import java.net.URI;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;

/**
 * Cloudflare R2 storage. R2 speaks the S3 API; we use the AWS SDK pointed at
 * the R2 endpoint. Active in profiles where R2 secrets are provided. The
 * controller decides whether to use this or the local fallback.
 */
@Slf4j
@Service
@Profile("!test")
public class R2StorageService {

    @Value("${r2.endpoint:}")
    private String endpoint;

    @Value("${r2.access-key-id:}")
    private String accessKeyId;

    @Value("${r2.secret-access-key:}")
    private String secretAccessKey;

    @Value("${r2.bucket:}")
    private String bucket;

    @Value("${r2.public-base-url:}")
    private String publicBaseUrl;

    private S3Client client;
    private S3Presigner presigner;

    @PostConstruct
    void init() {
        if (!isConfigured()) {
            log.info("R2 not configured (r2.endpoint blank). Using local storage fallback.");
            return;
        }
        AwsBasicCredentials creds = AwsBasicCredentials.create(accessKeyId, secretAccessKey);
        S3Configuration s3Cfg = S3Configuration.builder().pathStyleAccessEnabled(true).build();
        this.client = S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.of("auto"))
                .credentialsProvider(StaticCredentialsProvider.create(creds))
                .serviceConfiguration(s3Cfg)
                .build();
        this.presigner = S3Presigner.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.of("auto"))
                .credentialsProvider(StaticCredentialsProvider.create(creds))
                .serviceConfiguration(s3Cfg)
                .build();
        log.info("R2 storage configured for bucket={}", bucket);
    }

    @PreDestroy
    void shutdown() {
        if (client != null) client.close();
        if (presigner != null) presigner.close();
    }

    public boolean isConfigured() {
        return endpoint != null && !endpoint.isBlank()
                && accessKeyId != null && !accessKeyId.isBlank()
                && bucket != null && !bucket.isBlank();
    }

    /** Direct upload from server (small admin uploads). Returns the public URL. */
    public String storeFile(MultipartFile file) throws IOException {
        String key = generateKey(file.getOriginalFilename());
        PutObjectRequest req = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                .build();
        client.putObject(req, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        return toPublicUrl(key);
    }

    /**
     * Issue a presigned PUT URL the browser can upload to directly.
     * Returns { uploadUrl, publicUrl, key }.
     */
    public Map<String, String> presignPut(String filename, String contentType, Duration ttl) {
        String key = generateKey(filename);
        PutObjectRequest req = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(contentType != null ? contentType : "application/octet-stream")
                .build();
        PresignedPutObjectRequest signed = presigner.presignPutObject(b -> b
                .signatureDuration(ttl)
                .putObjectRequest(req));
        return Map.of(
                "uploadUrl", signed.url().toString(),
                "publicUrl", toPublicUrl(key),
                "key", key);
    }

    private String toPublicUrl(String key) {
        if (publicBaseUrl != null && !publicBaseUrl.isBlank()) {
            return publicBaseUrl.replaceAll("/$", "") + "/" + key;
        }
        return endpoint + "/" + bucket + "/" + key;
    }

    private static String generateKey(String originalName) {
        String safe = originalName == null ? "upload" : originalName.replaceAll("[^a-zA-Z0-9.-]", "_");
        return UUID.randomUUID() + "-" + safe;
    }
}
