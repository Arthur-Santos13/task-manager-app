package com.taskmanager.service;

import com.taskmanager.dto.TaskFilterRequest;
import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.entity.Role;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.TaskPriority;
import com.taskmanager.entity.TaskStatus;
import com.taskmanager.entity.User;
import com.taskmanager.exception.AccessDeniedException;
import com.taskmanager.exception.BusinessException;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.service.impl.TaskServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("TaskServiceImpl — unit tests")
class TaskServiceImplTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TaskServiceImpl taskService;

    private User creator;
    private User assignee;
    private Task task;
    private TaskRequest taskRequest;

    @BeforeEach
    void setUp() {
        creator = User.builder()
                .id(1L).name("Creator").email("creator@test.com")
                .password("pass").role(Role.USER).build();

        assignee = User.builder()
                .id(2L).name("Assignee").email("assignee@test.com")
                .password("pass").role(Role.USER).build();

        task = Task.builder()
                .id(1L).title("Test Task").description("Description")
                .assignee(assignee).priority(TaskPriority.HIGH)
                .dueDate(LocalDate.of(2026, 12, 31))
                .status(TaskStatus.IN_PROGRESS)
                .createdBy(creator).build();

        taskRequest = new TaskRequest(
                "Test Task", "Description", 2L,
                TaskPriority.HIGH, LocalDate.of(2026, 12, 31),
                TaskStatus.IN_PROGRESS
        );
    }

    // -------------------------------------------------------------------------
    // createTask
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("createTask — happy path returns populated TaskResponse")
    void createTask_success_returnsTaskResponse() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(assignee));
        when(taskRepository.save(any(Task.class))).thenReturn(task);

        TaskResponse response = taskService.createTask(taskRequest, creator);

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.title()).isEqualTo("Test Task");
        assertThat(response.status()).isEqualTo(TaskStatus.IN_PROGRESS);
        assertThat(response.assignee().id()).isEqualTo(2L);
        assertThat(response.createdBy().id()).isEqualTo(1L);
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    @DisplayName("createTask — unknown assigneeId throws ResourceNotFoundException")
    void createTask_assigneeNotFound_throwsResourceNotFoundException() {
        when(userRepository.findById(2L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.createTask(taskRequest, creator))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(taskRepository, never()).save(any());
    }

    // -------------------------------------------------------------------------
    // getTasks
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("getTasks — delegates to JPA spec and maps results")
    void getTasks_returnsFilteredList() {
        when(taskRepository.findAll(any(Specification.class))).thenReturn(List.of(task));

        List<TaskResponse> result = taskService.getTasks(
                new TaskFilterRequest(null, null, null, null, null, null, null));

        assertThat(result).hasSize(1);
        assertThat(result.get(0).title()).isEqualTo("Test Task");
    }

    // -------------------------------------------------------------------------
    // getTaskById
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("getTaskById — found returns response")
    void getTaskById_found_returnsResponse() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));

        assertThat(taskService.getTaskById(1L).id()).isEqualTo(1L);
    }

    @Test
    @DisplayName("getTaskById — not found throws ResourceNotFoundException")
    void getTaskById_notFound_throwsResourceNotFoundException() {
        when(taskRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.getTaskById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // -------------------------------------------------------------------------
    // updateTask
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("updateTask — creator may update their own task")
    void updateTask_asCreator_success() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(userRepository.findById(2L)).thenReturn(Optional.of(assignee));
        when(taskRepository.save(any(Task.class))).thenReturn(task);

        TaskResponse response = taskService.updateTask(1L, taskRequest, creator);

        assertThat(response.title()).isEqualTo("Test Task");
        verify(taskRepository).save(task);
    }

    @Test
    @DisplayName("updateTask — ADMIN may update any task")
    void updateTask_asAdmin_success() {
        User admin = User.builder().id(99L).role(Role.ADMIN).build();
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(userRepository.findById(2L)).thenReturn(Optional.of(assignee));
        when(taskRepository.save(any(Task.class))).thenReturn(task);

        assertThatNoException()
                .isThrownBy(() -> taskService.updateTask(1L, taskRequest, admin));
    }

    @Test
    @DisplayName("updateTask — third-party USER throws AccessDeniedException")
    void updateTask_notCreatorNotAdmin_throwsAccessDeniedException() {
        User stranger = User.builder().id(3L).role(Role.USER).build();
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));

        assertThatThrownBy(() -> taskService.updateTask(1L, taskRequest, stranger))
                .isInstanceOf(AccessDeniedException.class);
        verify(taskRepository, never()).save(any());
    }

    // -------------------------------------------------------------------------
    // deleteTask
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("deleteTask — creator may delete their own task")
    void deleteTask_asCreator_success() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));

        taskService.deleteTask(1L, creator);

        verify(taskRepository).delete(task);
    }

    @Test
    @DisplayName("deleteTask — third-party USER throws AccessDeniedException and does not delete")
    void deleteTask_notCreator_throwsAccessDeniedException() {
        User stranger = User.builder().id(3L).role(Role.USER).build();
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));

        assertThatThrownBy(() -> taskService.deleteTask(1L, stranger))
                .isInstanceOf(AccessDeniedException.class);
        verify(taskRepository, never()).delete(any());
    }

    // -------------------------------------------------------------------------
    // completeTask
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("completeTask — IN_PROGRESS task becomes COMPLETED")
    void completeTask_success_changesStatusToCompleted() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(taskRepository.save(task)).thenReturn(task);

        TaskResponse response = taskService.completeTask(1L, creator);

        assertThat(response.status()).isEqualTo(TaskStatus.COMPLETED);
        verify(taskRepository).save(task);
    }

    @Test
    @DisplayName("completeTask — already COMPLETED throws BusinessException")
    void completeTask_alreadyCompleted_throwsBusinessException() {
        task.setStatus(TaskStatus.COMPLETED);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));

        assertThatThrownBy(() -> taskService.completeTask(1L, creator))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already completed");
    }

    @Test
    @DisplayName("completeTask — CANCELLED task throws BusinessException")
    void completeTask_cancelled_throwsBusinessException() {
        task.setStatus(TaskStatus.CANCELLED);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));

        assertThatThrownBy(() -> taskService.completeTask(1L, creator))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("cancelled");
    }

    // -------------------------------------------------------------------------
    // cancelTask
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("cancelTask — IN_PROGRESS task becomes CANCELLED")
    void cancelTask_success_changesStatusToCancelled() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(taskRepository.save(task)).thenReturn(task);

        TaskResponse response = taskService.cancelTask(1L, creator);

        assertThat(response.status()).isEqualTo(TaskStatus.CANCELLED);
        verify(taskRepository).save(task);
    }

    @Test
    @DisplayName("cancelTask — already CANCELLED throws BusinessException")
    void cancelTask_alreadyCancelled_throwsBusinessException() {
        task.setStatus(TaskStatus.CANCELLED);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));

        assertThatThrownBy(() -> taskService.cancelTask(1L, creator))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already cancelled");
    }

    @Test
    @DisplayName("cancelTask — COMPLETED task throws BusinessException")
    void cancelTask_completed_throwsBusinessException() {
        task.setStatus(TaskStatus.COMPLETED);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));

        assertThatThrownBy(() -> taskService.cancelTask(1L, creator))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("completed");
    }
}

