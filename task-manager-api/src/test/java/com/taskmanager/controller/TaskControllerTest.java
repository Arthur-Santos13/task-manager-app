package com.taskmanager.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.dto.UserResponse;
import com.taskmanager.entity.Role;
import com.taskmanager.entity.TaskPriority;
import com.taskmanager.entity.TaskStatus;
import com.taskmanager.entity.User;
import com.taskmanager.exception.AccessDeniedException;
import com.taskmanager.exception.BusinessException;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.security.JwtService;
import com.taskmanager.service.TaskService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import com.taskmanager.config.SecurityConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Web-layer tests for {@link TaskController}.
 *
 * <p>Authentication strategy: the {@link com.taskmanager.security.JwtAuthenticationFilter}
 * is part of the filter chain even in {@code @WebMvcTest}. With
 * {@code SessionCreationPolicy.STATELESS}, Spring Security 6 discards any
 * security context injected via {@code MockMvcRequestPostProcessors.user()}.
 * Therefore every authenticated test sends an {@code Authorization: Bearer <token>}
 * header and the {@link JwtService} / {@link UserDetailsService} mocks are wired
 * to accept it, which is the same path taken in production.
 */
@WebMvcTest(TaskController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
@DisplayName("TaskController — web layer tests")
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // Required by SecurityConfig / JwtAuthenticationFilter
    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsService userDetailsService;

    // The subject under test
    @MockBean
    private TaskService taskService;

    private static final String TOKEN       = "fake-test-token";
    private static final String AUTH_HEADER = "Bearer " + TOKEN;
    private static final String TASKS_URL   = "/api/tasks";

    private User testUser;
    private TaskResponse sampleResponse;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .password("encoded-pass")
                .role(Role.USER)
                .build();

        UserResponse userDto = new UserResponse(
                1L, "Test User", "test@example.com", Role.USER,
                LocalDateTime.of(2026, 1, 1, 0, 0));

        sampleResponse = new TaskResponse(
                1L, "Test Task", "Description",
                userDto, TaskPriority.HIGH,
                LocalDate.of(2026, 12, 31),
                TaskStatus.IN_PROGRESS,
                userDto,
                LocalDateTime.of(2026, 1, 1, 0, 0),
                LocalDateTime.of(2026, 1, 1, 0, 0)
        );

        // Wire the JwtAuthenticationFilter mocks so any request carrying TOKEN is authenticated
        lenient().when(jwtService.extractUsername(TOKEN)).thenReturn("test@example.com");
        lenient().when(userDetailsService.loadUserByUsername("test@example.com")).thenReturn(testUser);
        lenient().when(jwtService.isTokenValid(eq(TOKEN), any(UserDetails.class))).thenReturn(true);
    }

    // -------------------------------------------------------------------------
    // POST /api/tasks
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("POST /api/tasks — valid body returns 201 with task")
    void createTask_validBody_returns201() throws Exception {
        when(taskService.createTask(any(), any())).thenReturn(sampleResponse);

        mockMvc.perform(post(TASKS_URL)
                        .header("Authorization", AUTH_HEADER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validTaskJson()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Test Task"))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
    }

    @Test
    @DisplayName("POST /api/tasks — missing required fields returns 400")
    void createTask_missingTitle_returns400() throws Exception {
        String invalidBody = """
                {
                  "description": "No title here",
                  "assigneeId": 2,
                  "dueDate": "31/12/2026"
                }
                """;

        mockMvc.perform(post(TASKS_URL)
                        .header("Authorization", AUTH_HEADER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("POST /api/tasks — no Authorization header returns 403")
    void createTask_noAuth_returns403() throws Exception {
        mockMvc.perform(post(TASKS_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validTaskJson()))
                .andExpect(status().isForbidden());
    }

    // -------------------------------------------------------------------------
    // GET /api/tasks
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("GET /api/tasks — no filters returns 200 with list")
    void getTasks_noFilters_returns200WithList() throws Exception {
        when(taskService.getTasks(any())).thenReturn(List.of(sampleResponse));

        mockMvc.perform(get(TASKS_URL).header("Authorization", AUTH_HEADER))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Test Task"));
    }

    @Test
    @DisplayName("GET /api/tasks — with status and priority filters returns 200")
    void getTasks_withFilters_returns200() throws Exception {
        when(taskService.getTasks(any())).thenReturn(List.of(sampleResponse));

        mockMvc.perform(get(TASKS_URL)
                        .header("Authorization", AUTH_HEADER)
                        .param("status", "IN_PROGRESS")
                        .param("priority", "HIGH"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].priority").value("HIGH"));
    }

    @Test
    @DisplayName("GET /api/tasks — 'until:' dueDateUntil filter returns 200")
    void getTasks_withDueDateUntilFilter_returns200() throws Exception {
        when(taskService.getTasks(any())).thenReturn(List.of(sampleResponse));

        mockMvc.perform(get(TASKS_URL)
                        .header("Authorization", AUTH_HEADER)
                        .param("dueDateUntil", "31/12/2026"))
                .andExpect(status().isOk());
    }

    // -------------------------------------------------------------------------
    // GET /api/tasks/{id}
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("GET /api/tasks/{id} — existing task returns 200")
    void getTaskById_found_returns200() throws Exception {
        when(taskService.getTaskById(1L)).thenReturn(sampleResponse);

        mockMvc.perform(get(TASKS_URL + "/1").header("Authorization", AUTH_HEADER))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    @DisplayName("GET /api/tasks/{id} — unknown id returns 404 with error body")
    void getTaskById_notFound_returns404() throws Exception {
        when(taskService.getTaskById(99L))
                .thenThrow(new ResourceNotFoundException("Task", 99L));

        mockMvc.perform(get(TASKS_URL + "/99").header("Authorization", AUTH_HEADER))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    // -------------------------------------------------------------------------
    // PUT /api/tasks/{id}
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("PUT /api/tasks/{id} — valid update returns 200")
    void updateTask_validBody_returns200() throws Exception {
        when(taskService.updateTask(eq(1L), any(), any())).thenReturn(sampleResponse);

        mockMvc.perform(put(TASKS_URL + "/1")
                        .header("Authorization", AUTH_HEADER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validTaskJson()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    @DisplayName("PUT /api/tasks/{id} — not found returns 404")
    void updateTask_notFound_returns404() throws Exception {
        when(taskService.updateTask(eq(99L), any(), any()))
                .thenThrow(new ResourceNotFoundException("Task", 99L));

        mockMvc.perform(put(TASKS_URL + "/99")
                        .header("Authorization", AUTH_HEADER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validTaskJson()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("PUT /api/tasks/{id} — access denied returns 403")
    void updateTask_accessDenied_returns403() throws Exception {
        when(taskService.updateTask(eq(1L), any(), any()))
                .thenThrow(new AccessDeniedException("You do not have permission to update this task."));

        mockMvc.perform(put(TASKS_URL + "/1")
                        .header("Authorization", AUTH_HEADER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validTaskJson()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    // -------------------------------------------------------------------------
    // DELETE /api/tasks/{id}
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("DELETE /api/tasks/{id} — existing task returns 204")
    void deleteTask_existing_returns204() throws Exception {
        doNothing().when(taskService).deleteTask(eq(1L), any());

        mockMvc.perform(delete(TASKS_URL + "/1").header("Authorization", AUTH_HEADER))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /api/tasks/{id} — not found returns 404")
    void deleteTask_notFound_returns404() throws Exception {
        doThrow(new ResourceNotFoundException("Task", 99L)).when(taskService).deleteTask(eq(99L), any());

        mockMvc.perform(delete(TASKS_URL + "/99").header("Authorization", AUTH_HEADER))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("DELETE /api/tasks/{id} — access denied returns 403")
    void deleteTask_accessDenied_returns403() throws Exception {
        doThrow(new AccessDeniedException("You do not have permission to delete this task."))
                .when(taskService).deleteTask(eq(1L), any());

        mockMvc.perform(delete(TASKS_URL + "/1").header("Authorization", AUTH_HEADER))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    // -------------------------------------------------------------------------
    // PATCH /api/tasks/{id}/complete
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("PATCH /api/tasks/{id}/complete — returns 200 with COMPLETED status")
    void completeTask_returns200() throws Exception {
        when(taskService.completeTask(eq(1L), any())).thenReturn(buildWithStatus(TaskStatus.COMPLETED));

        mockMvc.perform(patch(TASKS_URL + "/1/complete").header("Authorization", AUTH_HEADER))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    @DisplayName("PATCH /api/tasks/{id}/complete — already completed returns 409")
    void completeTask_alreadyCompleted_returns409() throws Exception {
        when(taskService.completeTask(eq(1L), any()))
                .thenThrow(new BusinessException("Task is already completed."));

        mockMvc.perform(patch(TASKS_URL + "/1/complete").header("Authorization", AUTH_HEADER))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Task is already completed."));
    }

    @Test
    @DisplayName("PATCH /api/tasks/{id}/complete — not found returns 404")
    void completeTask_notFound_returns404() throws Exception {
        when(taskService.completeTask(eq(99L), any()))
                .thenThrow(new ResourceNotFoundException("Task", 99L));

        mockMvc.perform(patch(TASKS_URL + "/99/complete").header("Authorization", AUTH_HEADER))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    // -------------------------------------------------------------------------
    // PATCH /api/tasks/{id}/cancel
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("PATCH /api/tasks/{id}/cancel — returns 200 with CANCELLED status")
    void cancelTask_returns200() throws Exception {
        when(taskService.cancelTask(eq(1L), any())).thenReturn(buildWithStatus(TaskStatus.CANCELLED));

        mockMvc.perform(patch(TASKS_URL + "/1/cancel").header("Authorization", AUTH_HEADER))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }

    @Test
    @DisplayName("PATCH /api/tasks/{id}/cancel — already cancelled returns 409")
    void cancelTask_alreadyCancelled_returns409() throws Exception {
        when(taskService.cancelTask(eq(1L), any()))
                .thenThrow(new BusinessException("Task is already cancelled."));

        mockMvc.perform(patch(TASKS_URL + "/1/cancel").header("Authorization", AUTH_HEADER))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Task is already cancelled."));
    }

    @Test
    @DisplayName("PATCH /api/tasks/{id}/cancel — not found returns 404")
    void cancelTask_notFound_returns404() throws Exception {
        when(taskService.cancelTask(eq(99L), any()))
                .thenThrow(new ResourceNotFoundException("Task", 99L));

        mockMvc.perform(patch(TASKS_URL + "/99/cancel").header("Authorization", AUTH_HEADER))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    // -------------------------------------------------------------------------
    // PATCH /api/tasks/{id}/start
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("PATCH /api/tasks/{id}/start — returns 200 with IN_PROGRESS status")
    void startTask_returns200() throws Exception {
        when(taskService.startTask(eq(1L), any())).thenReturn(buildWithStatus(TaskStatus.IN_PROGRESS));

        mockMvc.perform(patch(TASKS_URL + "/1/start").header("Authorization", AUTH_HEADER))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
    }

    @Test
    @DisplayName("PATCH /api/tasks/{id}/start — non-TODO task returns 409")
    void startTask_notTodo_returns409() throws Exception {
        when(taskService.startTask(eq(1L), any()))
                .thenThrow(new BusinessException("Only tasks with status TODO can be started."));

        mockMvc.perform(patch(TASKS_URL + "/1/start").header("Authorization", AUTH_HEADER))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Only tasks with status TODO can be started."));
    }

    @Test
    @DisplayName("PATCH /api/tasks/{id}/start — access denied returns 403")
    void startTask_accessDenied_returns403() throws Exception {
        when(taskService.startTask(eq(1L), any()))
                .thenThrow(new AccessDeniedException("Only the assigned user or an admin can start this task."));

        mockMvc.perform(patch(TASKS_URL + "/1/start").header("Authorization", AUTH_HEADER))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private String validTaskJson() {
        return """
                {
                  "title": "Test Task",
                  "description": "Description",
                  "assigneeId": 2,
                  "priority": "HIGH",
                  "dueDate": "31/12/2026",
                  "status": "IN_PROGRESS"
                }
                """;
    }

    private TaskResponse buildWithStatus(TaskStatus status) {
        UserResponse userDto = new UserResponse(
                1L, "Test User", "test@example.com", Role.USER,
                LocalDateTime.of(2026, 1, 1, 0, 0));
        return new TaskResponse(
                1L, "Test Task", "Description",
                userDto, TaskPriority.HIGH,
                LocalDate.of(2026, 12, 31),
                status, userDto,
                LocalDateTime.of(2026, 1, 1, 0, 0),
                LocalDateTime.of(2026, 1, 1, 0, 0)
        );
    }
}

