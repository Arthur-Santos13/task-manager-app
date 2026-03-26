package com.taskmanager.service.impl;

import com.taskmanager.dto.AuthResponse;
import com.taskmanager.dto.LoginRequest;
import com.taskmanager.dto.RegisterRequest;
import com.taskmanager.security.JwtService;
import com.taskmanager.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           PasswordEncoder passwordEncoder,
                           JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        throw new UnsupportedOperationException("Login not implemented yet");
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        throw new UnsupportedOperationException("Register not implemented yet");
    }
}

