package com.taskmanager.dto;

import com.taskmanager.entity.Role;

public record UserResponse(
        Long id,
        String name,
        String email,
        Role role
) {
}

