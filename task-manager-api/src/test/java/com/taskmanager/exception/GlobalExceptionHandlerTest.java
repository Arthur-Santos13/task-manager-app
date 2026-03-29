package com.taskmanager.exception;

import com.taskmanager.dto.ErrorResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("GlobalExceptionHandler — unit tests")
class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

    @Test
    @DisplayName("handleNotFound — returns 404 with message")
    void handleNotFound_returns404() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Task", 1L);

        ResponseEntity<ErrorResponse> response = handler.handleNotFound(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().status()).isEqualTo(404);
        assertThat(response.getBody().message()).contains("Task not found");
    }

    @Test
    @DisplayName("handleAccessDenied — returns 403 with message")
    void handleAccessDenied_returns403() {
        AccessDeniedException ex = new AccessDeniedException("No permission");

        ResponseEntity<ErrorResponse> response = handler.handleAccessDenied(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().status()).isEqualTo(403);
        assertThat(response.getBody().message()).isEqualTo("No permission");
    }

    @Test
    @DisplayName("handleSpringAccessDenied — returns 403 with generic message")
    void handleSpringAccessDenied_returns403() {
        org.springframework.security.access.AccessDeniedException ex =
                new org.springframework.security.access.AccessDeniedException("Denied");

        ResponseEntity<ErrorResponse> response = handler.handleSpringAccessDenied(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().status()).isEqualTo(403);
    }

    @Test
    @DisplayName("handleBusiness — returns 409 with message")
    void handleBusiness_returns409() {
        BusinessException ex = new BusinessException("Task is already completed.");

        ResponseEntity<ErrorResponse> response = handler.handleBusiness(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().status()).isEqualTo(409);
        assertThat(response.getBody().message()).isEqualTo("Task is already completed.");
    }

    @Test
    @DisplayName("handleDataIntegrity — duplicate email returns 409 with Portuguese message")
    void handleDataIntegrity_duplicateEmail_returns409() {
        DataIntegrityViolationException ex = new DataIntegrityViolationException(
                "unique constraint violated on email column");

        ResponseEntity<ErrorResponse> response = handler.handleDataIntegrity(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().message()).isEqualTo("E-mail já está em uso.");
    }

    @Test
    @DisplayName("handleDataIntegrity — non-email constraint returns generic message")
    void handleDataIntegrity_otherConstraint_returns409() {
        DataIntegrityViolationException ex = new DataIntegrityViolationException(
                "unique constraint violated on name column");

        ResponseEntity<ErrorResponse> response = handler.handleDataIntegrity(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().message()).isEqualTo("Violação de integridade de dados.");
    }

    @Test
    @DisplayName("handleIllegalArgument — returns 400 with message")
    void handleIllegalArgument_returns400() {
        IllegalArgumentException ex = new IllegalArgumentException("E-mail already in use: dup@test.com");

        ResponseEntity<ErrorResponse> response = handler.handleIllegalArgument(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().status()).isEqualTo(400);
        assertThat(response.getBody().message()).contains("E-mail already in use");
    }

    @Test
    @DisplayName("handleBadCredentials — returns 401")
    void handleBadCredentials_returns401() {
        BadCredentialsException ex = new BadCredentialsException("Bad credentials");

        ResponseEntity<ErrorResponse> response = handler.handleBadCredentials(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().status()).isEqualTo(401);
        assertThat(response.getBody().message()).isEqualTo("Invalid email or password.");
    }

    @Test
    @DisplayName("handleValidation — returns 400 with field errors")
    void handleValidation_returns400WithFieldErrors() {
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "request");
        bindingResult.addError(new FieldError("request", "title", "must not be blank"));
        bindingResult.addError(new FieldError("request", "assigneeId", "must not be null"));
        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(null, bindingResult);

        ResponseEntity<ErrorResponse> response = handler.handleValidation(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().status()).isEqualTo(400);
        assertThat(response.getBody().fieldErrors()).containsKey("title");
        assertThat(response.getBody().fieldErrors()).containsKey("assigneeId");
    }

    @Test
    @DisplayName("handleGeneric — returns 500")
    void handleGeneric_returns500() {
        Exception ex = new RuntimeException("Something unexpected");

        ResponseEntity<ErrorResponse> response = handler.handleGeneric(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().status()).isEqualTo(500);
        assertThat(response.getBody().message()).isEqualTo("An unexpected error occurred.");
    }
}

