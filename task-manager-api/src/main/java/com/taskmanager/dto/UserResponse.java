package com.taskmanager.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.taskmanager.entity.Role;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String name,
        String email,
        Role role,
        @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss") LocalDateTime createdAt
) {
}
