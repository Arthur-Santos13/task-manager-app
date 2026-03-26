package com.taskmanager.security;

import org.springframework.stereotype.Service;

@Service
public class JwtService {

    public String extractUsername(String token) {
        throw new UnsupportedOperationException("JWT username extraction not implemented yet");
    }

    public String generateToken(String username) {
        throw new UnsupportedOperationException("JWT generation not implemented yet");
    }

    public boolean isTokenValid(String token, String username) {
        throw new UnsupportedOperationException("JWT validation not implemented yet");
    }
}

