package com.taskmanager.service.impl;

import com.taskmanager.dto.TaskFilterRequest;
import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.dto.UserResponse;
import com.taskmanager.entity.Role;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.TaskStatus;
import com.taskmanager.entity.User;
import com.taskmanager.exception.AccessDeniedException;
import com.taskmanager.exception.BusinessException;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.service.TaskService;
import com.taskmanager.specification.TaskSpecification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskServiceImpl(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    // -------------------------------------------------------------------------
    // createTask
    // -------------------------------------------------------------------------

    @Override
    public TaskResponse createTask(TaskRequest request, User currentUser) {
        User assignee = userRepository.findById(request.assigneeId())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.assigneeId()));

        Task task = Task.builder()
                .title(request.title())
                .description(request.description())
                .assignee(assignee)
                .priority(request.priority() != null ? request.priority() : com.taskmanager.entity.TaskPriority.LOW)
                .dueDate(request.dueDate())
                .status(request.status() != null ? request.status() : TaskStatus.TODO)
                .createdBy(currentUser)
                .build();

        return toResponse(taskRepository.save(task));
    }

    // -------------------------------------------------------------------------
    // getTasks
    // -------------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponse> getTasks(TaskFilterRequest filter) {
        return taskRepository
                .findAll(TaskSpecification.withFilters(filter))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // -------------------------------------------------------------------------
    // getTaskById
    // -------------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long id) {
        return toResponse(findTaskOrThrow(id));
    }

    // -------------------------------------------------------------------------
    // updateTask
    // -------------------------------------------------------------------------

    @Override
    public TaskResponse updateTask(Long id, TaskRequest request, User currentUser) {
        Task task = findTaskOrThrow(id);
        requireCreatorOrAdmin(task, currentUser, "update");

        User assignee = userRepository.findById(request.assigneeId())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.assigneeId()));

        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setAssignee(assignee);
        task.setPriority(request.priority() != null ? request.priority() : task.getPriority());
        task.setDueDate(request.dueDate());

        // Allow status update only when not trying to "un-complete" or "un-cancel" a finished task
        if (request.status() != null) {
            validateStatusTransition(task.getStatus(), request.status());
            task.setStatus(request.status());
        }

        return toResponse(taskRepository.save(task));
    }

    // -------------------------------------------------------------------------
    // deleteTask
    // -------------------------------------------------------------------------

    @Override
    public void deleteTask(Long id, User currentUser) {
        Task task = findTaskOrThrow(id);
        requireCreatorOrAdmin(task, currentUser, "delete");
        taskRepository.delete(task);
    }

    // -------------------------------------------------------------------------
    // completeTask
    // -------------------------------------------------------------------------

    @Override
    public TaskResponse completeTask(Long id, User currentUser) {
        Task task = findTaskOrThrow(id);

        if (task.getStatus() == TaskStatus.COMPLETED) {
            throw new BusinessException("Task is already completed.");
        }
        if (task.getStatus() == TaskStatus.CANCELLED) {
            throw new BusinessException("A cancelled task cannot be completed.");
        }

        task.setStatus(TaskStatus.COMPLETED);
        return toResponse(taskRepository.save(task));
    }

    // -------------------------------------------------------------------------
    // cancelTask
    // -------------------------------------------------------------------------

    @Override
    public TaskResponse cancelTask(Long id, User currentUser) {
        Task task = findTaskOrThrow(id);

        if (task.getStatus() == TaskStatus.CANCELLED) {
            throw new BusinessException("Task is already cancelled.");
        }
        if (task.getStatus() == TaskStatus.COMPLETED) {
            throw new BusinessException("A completed task cannot be cancelled.");
        }

        task.setStatus(TaskStatus.CANCELLED);
        return toResponse(taskRepository.save(task));
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private Task findTaskOrThrow(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));
    }

    /**
     * Enforces that only the task creator or an ADMIN user may perform
     * sensitive operations (update, delete).
     */
    private void requireCreatorOrAdmin(Task task, User currentUser, String action) {
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        boolean isCreator = task.getCreatedBy().getId().equals(currentUser.getId());

        if (!isAdmin && !isCreator) {
            throw new AccessDeniedException(
                    "You do not have permission to " + action + " this task.");
        }
    }

    /**
     * Prevents illegal status transitions on update —
     * e.g. moving back from COMPLETED/CANCELLED to an active state.
     */
    private void validateStatusTransition(TaskStatus current, TaskStatus requested) {
        if (current == TaskStatus.COMPLETED && requested != TaskStatus.COMPLETED) {
            throw new BusinessException("A completed task cannot be moved back to: " + requested);
        }
        if (current == TaskStatus.CANCELLED && requested != TaskStatus.CANCELLED) {
            throw new BusinessException("A cancelled task cannot be moved back to: " + requested);
        }
    }

    // -------------------------------------------------------------------------
    // Mapping
    // -------------------------------------------------------------------------

    private TaskResponse toResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                toUserResponse(task.getAssignee()),
                task.getPriority(),
                task.getDueDate(),
                task.getStatus(),
                toUserResponse(task.getCreatedBy()),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
}

