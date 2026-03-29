package com.taskmanager.security;

import com.taskmanager.entity.Role;
import com.taskmanager.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("JwtService — unit tests")
class JwtServiceTest {

    private JwtService jwtService;

    private static final String SECRET = "this-is-a-very-secret-key-for-unit-tests-32chars!";
    private static final long EXPIRATION_MS = 3600000; // 1h

    private User testUser;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret", SECRET);
        ReflectionTestUtils.setField(jwtService, "expirationMs", EXPIRATION_MS);

        testUser = User.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .password("encoded-pass")
                .role(Role.USER)
                .build();
    }

    @Test
    @DisplayName("generateToken — produces a non-empty token")
    void generateToken_returnsNonEmptyToken() {
        String token = jwtService.generateToken(testUser);

        assertThat(token).isNotBlank();
    }

    @Test
    @DisplayName("extractUsername — returns the e-mail used as subject")
    void extractUsername_returnsEmailFromToken() {
        String token = jwtService.generateToken(testUser);

        String username = jwtService.extractUsername(token);

        assertThat(username).isEqualTo("test@example.com");
    }

    @Test
    @DisplayName("isTokenValid — valid token returns true")
    void isTokenValid_validToken_returnsTrue() {
        String token = jwtService.generateToken(testUser);

        boolean valid = jwtService.isTokenValid(token, testUser);

        assertThat(valid).isTrue();
    }

    @Test
    @DisplayName("isTokenValid — token for different user returns false")
    void isTokenValid_differentUser_returnsFalse() {
        String token = jwtService.generateToken(testUser);

        User otherUser = User.builder()
                .id(2L).name("Other").email("other@example.com")
                .password("pass").role(Role.USER).build();

        boolean valid = jwtService.isTokenValid(token, otherUser);

        assertThat(valid).isFalse();
    }

    @Test
    @DisplayName("isTokenValid — expired token throws ExpiredJwtException")
    void isTokenValid_expiredToken_throwsException() {
        // Create a service with negative expiration so the token is already expired
        JwtService expiredService = new JwtService();
        ReflectionTestUtils.setField(expiredService, "secret", SECRET);
        ReflectionTestUtils.setField(expiredService, "expirationMs", -1000L);

        String token = expiredService.generateToken(testUser);

        // The parser throws ExpiredJwtException before isTokenValid can return false
        assertThatThrownBy(() -> jwtService.isTokenValid(token, testUser))
                .isInstanceOf(io.jsonwebtoken.ExpiredJwtException.class);
    }

    @Test
    @DisplayName("extractUsername — tampered token throws exception")
    void extractUsername_tamperedToken_throwsException() {
        String token = jwtService.generateToken(testUser);
        String tampered = token + "TAMPERED";

        assertThatThrownBy(() -> jwtService.extractUsername(tampered))
                .isInstanceOf(Exception.class);
    }
}

