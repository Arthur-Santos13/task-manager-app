package com.taskmanager.controller;

import com.taskmanager.config.SecurityConfig;
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

    private User regularUser;

    @BeforeEach
    void setUp() {
        regularUser = User.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .password("encoded-pass")
                .role(Role.USER)
                .build();

        lenient().when(jwtService.extractUsername(TOKEN)).thenReturn("test@example.com");
        lenient().when(userDetailsService.loadUserByUsername("test@example.com")).thenReturn(regularUser);
        lenient().when(jwtService.isTokenValid(eq(TOKEN), any(UserDetails.class))).thenReturn(true);
    }

    // -------------------------------------------------------------------------
    // GET /api/users/picker
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("GET /api/users/picker — returns id and name for each user")
    void listPicker_returns200() throws Exception {
        User user2 = User.builder().id(2L).name("Bob").email("bob@test.com")
                .password("pass").role(Role.USER)
                .build();
        when(userRepository.findAll()).thenReturn(List.of(regularUser, user2));

        mockMvc.perform(get(USERS_URL + "/picker").header("Authorization", AUTH_HEADER))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Test User"))
                .andExpect(jsonPath("$[1].name").value("Bob"));
    }

    @Test
    @DisplayName("GET /api/users/picker — no auth returns 403")
    void listPicker_noAuth_returns403() throws Exception {
        mockMvc.perform(get(USERS_URL + "/picker"))
                .andExpect(status().isForbidden());
    }

    // -------------------------------------------------------------------------
    // GET /api/users (ADMIN)
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("GET /api/users — ADMIN returns 200 with list")
    void listUsers_asAdmin_returns200() throws Exception {
        User admin = User.builder()
                .id(1L).name("Admin").email("test@example.com")
                .password("encoded-pass").role(Role.ADMIN)
                .build();
        when(userDetailsService.loadUserByUsername("test@example.com")).thenReturn(admin);

        User user2 = User.builder().id(2L).name("Bob").email("bob@test.com")
                .password("pass").role(Role.USER)
                .build();
        when(userRepository.findAll()).thenReturn(List.of(admin, user2));

        mockMvc.perform(get(USERS_URL).header("Authorization", AUTH_HEADER))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Admin"))
                .andExpect(jsonPath("$[1].name").value("Bob"));
    }

    @Test
    @DisplayName("GET /api/users — regular USER returns 403")
    void listUsers_asRegularUser_returns403() throws Exception {
        mockMvc.perform(get(USERS_URL).header("Authorization", AUTH_HEADER))
                .andExpect(status().isForbidden());
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
    @DisplayName("GET /api/users/{id} — self returns 200 with full profile")
    void getUserById_self_returns200() throws Exception {
        when(userRepository.findById(1L)).thenReturn(Optional.of(regularUser));

        mockMvc.perform(get(USERS_URL + "/1").header("Authorization", AUTH_HEADER))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Test User"))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    @DisplayName("GET /api/users/{id} — viewing another user returns 403")
    void getUserById_otherUser_returns403() throws Exception {
        User other = User.builder().id(2L).name("Bob").email("bob@test.com")
                .password("pass").role(Role.USER)
                .build();
        when(userRepository.findById(2L)).thenReturn(Optional.of(other));

        mockMvc.perform(get(USERS_URL + "/2").header("Authorization", AUTH_HEADER))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @DisplayName("GET /api/users/{id} — ADMIN may view any user")
    void getUserById_asAdmin_returns200() throws Exception {
        User admin = User.builder()
                .id(1L).name("Admin").email("test@example.com")
                .password("p").role(Role.ADMIN)
                .build();
        when(userDetailsService.loadUserByUsername("test@example.com")).thenReturn(admin);

        User other = User.builder().id(2L).name("Bob").email("bob@test.com")
                .password("pass").role(Role.USER)
                .build();
        when(userRepository.findById(2L)).thenReturn(Optional.of(other));

        mockMvc.perform(get(USERS_URL + "/2").header("Authorization", AUTH_HEADER))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.email").value("bob@test.com"));
    }

    @Test
    @DisplayName("GET /api/users/{id} — ADMIN and unknown id returns 404")
    void getUserById_notFound_whenAdmin_returns404() throws Exception {
        User admin = User.builder()
                .id(1L).name("Admin").email("test@example.com")
                .password("p").role(Role.ADMIN)
                .build();
        when(userDetailsService.loadUserByUsername("test@example.com")).thenReturn(admin);
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get(USERS_URL + "/99").header("Authorization", AUTH_HEADER))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }
}
