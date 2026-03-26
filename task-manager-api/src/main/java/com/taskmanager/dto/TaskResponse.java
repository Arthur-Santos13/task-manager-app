package com.taskmanager.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.taskmanager.entity.TaskPriority;
import com.taskmanager.entity.TaskStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record TaskResponse(
        Long id,
        String title,
        String description,
        UserResponse assignee,
        TaskPriority priority,
        @JsonFormat(pattern = "dd/MM/yyyy") LocalDate dueDate,
        TaskStatus status,
        UserResponse createdBy,
        @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss") LocalDateTime createdAt,
        @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss") LocalDateTime updatedAt
) {
}
