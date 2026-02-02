package com.peakkineticspt.dto.uploadthing;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class UploadFileRequest {
    private List<FileDefinition> files;

    @Data
    @Builder
    public static class FileDefinition {
        private String name;
        private long size;
        private String type;
    }
}
