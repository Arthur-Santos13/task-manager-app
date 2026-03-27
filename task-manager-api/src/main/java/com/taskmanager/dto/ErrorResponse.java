package com.taskmanager.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.util.Map;

public record ErrorResponse(
        int status,
        String error,
        String message,
        @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss") LocalDateTime timestamp,
        Map<String, String> fieldErrors
) {
    /** Convenience constructor — no field-level errors. */
    public ErrorResponse(int status, String error, String message) {
        this(status, error, message, LocalDateTime.now(), null);
    }

    /** Convenience constructor — with field-level errors. */
    public ErrorResponse(int status, String error, String message, Map<String, String> fieldErrors) {
        this(status, error, message, LocalDateTime.now(), fieldErrors);
    }
}

