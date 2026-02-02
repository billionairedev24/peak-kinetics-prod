package com.peakkineticspt.dto.uploadthing;

import lombok.Data;
import java.util.Map;

@Data
public class UploadFileResponse {
    private UploadFileData data;

    @Data
    public static class UploadFileData {
        private String presignedUrl;
        private String fileKey;
        private String fileName;
        private long fileSize;
        private String fileType;
        private Map<String, String> fields;
    }
}
