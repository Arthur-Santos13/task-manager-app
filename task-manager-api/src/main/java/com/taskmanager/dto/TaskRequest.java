package com.taskmanager.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.taskmanager.entity.TaskPriority;
import com.taskmanager.entity.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record TaskRequest(
        @NotBlank String title,
        String description,
        @NotNull Long assigneeId,
        TaskPriority priority,
        @NotNull @JsonFormat(pattern = "dd/MM/yyyy") LocalDate dueDate,
        TaskStatus status
) {
}
