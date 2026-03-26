package com.taskmanager.dto;

import com.taskmanager.entity.TaskStatus;

import java.time.LocalDateTime;

public record TaskResponse(
        Long id,
        String title,
        String description,
        TaskStatus status,
        LocalDateTime dueDate,
        Long userId
) {
}

