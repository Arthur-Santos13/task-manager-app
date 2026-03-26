package com.taskmanager.dto;

public record AuthResponse(
        String token,
        String tokenType,
        Long userId,
        String email
) {
}

