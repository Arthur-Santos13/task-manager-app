package com.taskmanager.controller;

import com.taskmanager.config.SecurityConfig;
import com.taskmanager.dto.UserResponse;
import com.taskmanager.entity.Role;
import com.taskmanager.entity.User;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
@DisplayName("UserController — web layer tests")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsService userDetailsService;

    @MockBean
    private UserRepository userRepository;

    private static final String TOKEN       = "fake-test-token";
    private static final String AUTH_HEADER = "Bearer " + TOKEN;
    private static final String USERS_URL   = "/api/users";

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .password("encoded-pass")
                .role(Role.USER)
                .build();

        lenient().when(jwtService.extractUsername(TOKEN)).thenReturn("test@example.com");
        lenient().when(userDetailsService.loadUserByUsername("test@example.com")).thenReturn(testUser);
        lenient().when(jwtService.isTokenValid(eq(TOKEN), any(UserDetails.class))).thenReturn(true);
    }

    // -------------------------------------------------------------------------
    // GET /api/users
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("GET /api/users — returns 200 with list of users")
    void listUsers_returns200() throws Exception {
        User user1 = User.builder().id(1L).name("Alice").email("alice@test.com")
                .password("pass").role(Role.USER)
                .build();
        User user2 = User.builder().id(2L).name("Bob").email("bob@test.com")
                .password("pass").role(Role.ADMIN)
                .build();

        when(userRepository.findAll()).thenReturn(List.of(user1, user2));

        mockMvc.perform(get(USERS_URL).header("Authorization", AUTH_HEADER))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Alice"))
                .andExpect(jsonPath("$[1].name").value("Bob"));
    }

    @Test
    @DisplayName("GET /api/users — empty list returns 200 with []")
    void listUsers_empty_returns200() throws Exception {
        when(userRepository.findAll()).thenReturn(List.of());

        mockMvc.perform(get(USERS_URL).header("Authorization", AUTH_HEADER))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @DisplayName("GET /api/users — no auth returns 403")
    void listUsers_noAuth_returns403() throws Exception {
        mockMvc.perform(get(USERS_URL))
                .andExpect(status().isForbidden());
    }

    // -------------------------------------------------------------------------
    // GET /api/users/{id}
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("GET /api/users/{id} — existing user returns 200")
    void getUserById_found_returns200() throws Exception {
        User user = User.builder().id(1L).name("Alice").email("alice@test.com")
                .password("pass").role(Role.USER).build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        mockMvc.perform(get(USERS_URL + "/1").header("Authorization", AUTH_HEADER))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Alice"))
                .andExpect(jsonPath("$.email").value("alice@test.com"));
    }

    @Test
    @DisplayName("GET /api/users/{id} — unknown id returns 404")
    void getUserById_notFound_returns404() throws Exception {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get(USERS_URL + "/99").header("Authorization", AUTH_HEADER))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }
}

