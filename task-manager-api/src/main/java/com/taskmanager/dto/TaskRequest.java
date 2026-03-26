package com.taskmanager.dto;

import com.taskmanager.entity.TaskStatus;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

public record TaskRequest(
        @NotBlank String title,
        String description,
        TaskStatus status,
        LocalDateTime dueDate
) {
}

