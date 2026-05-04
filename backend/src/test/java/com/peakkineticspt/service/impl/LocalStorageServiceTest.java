package com.peakkineticspt.service.impl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class LocalStorageServiceTest {

    @TempDir
    Path tmp;

    LocalStorageService service;

    @BeforeEach
    void init() {
        service = new LocalStorageService();
        ReflectionTestUtils.setField(service, "uploadDir", tmp.toString());

        MockHttpServletRequest req = new MockHttpServletRequest();
        req.setScheme("https");
        req.setServerName("api.peakkineticspt.com");
        req.setServerPort(443);
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(req));
    }

    @Test
    void storeFile_writesToDiskAndReturnsUrl() throws Exception {
        byte[] content = "hello".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "file", "report.pdf", "application/pdf", content);

        String url = service.storeFile(file);

        assertThat(url).startsWith("https://api.peakkineticspt.com/uploads/");
        assertThat(url).endsWith("_report.pdf");

        Path stored = Files.list(tmp).findFirst().orElseThrow();
        assertThat(Files.readAllBytes(stored)).isEqualTo(content);
    }

    @Test
    void filenameWithSpecialChars_isSanitized() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "../../etc/passwd", "text/plain", "x".getBytes());

        String url = service.storeFile(file);

        // No path traversal — slashes/dots stripped/replaced
        assertThat(url).doesNotContain("../");
        assertThat(url).doesNotContain("etc/passwd");
        // The sanitized name preserves alphanumeric, dots, hyphens
        assertThat(url).matches(".*/uploads/\\d+_[a-zA-Z0-9._-]+");
    }

    @Test
    void filenameWithSpaces_isSanitized() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "my file (final).png", "image/png", "data".getBytes());

        String url = service.storeFile(file);

        assertThat(url).doesNotContain(" ");
        assertThat(url).doesNotContain("(");
        assertThat(url).endsWith("_my_file__final_.png");
    }

    @Test
    void nullOriginalFilename_handledGracefully() {
        MockMultipartFile file = new MockMultipartFile(
                "file", null, "application/octet-stream", "x".getBytes());

        String url = service.storeFile(file);

        assertThat(url).contains("/uploads/");
    }

    @Test
    void multipleUploadsSameName_yieldDifferentFiles() throws Exception {
        MockMultipartFile a = new MockMultipartFile("file", "x.txt", "text/plain", "a".getBytes());
        Thread.sleep(2); // ensure currentTimeMillis differs
        MockMultipartFile b = new MockMultipartFile("file", "x.txt", "text/plain", "b".getBytes());

        String urlA = service.storeFile(a);
        String urlB = service.storeFile(b);

        assertThat(urlA).isNotEqualTo(urlB);
        assertThat(Files.list(tmp).count()).isEqualTo(2);
    }
}
