package com.taskmanager.service;

import com.taskmanager.dto.PagedTasksResponse;
import com.taskmanager.dto.TaskFilterRequest;
import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.entity.User;
import org.springframework.data.domain.Pageable;

public interface TaskService {

    /** Creates a new task. The authenticated user is recorded as the creator. */
    TaskResponse createTask(TaskRequest request, User currentUser);

    /**
     * Returns a page of tasks matching the filter and visible to the current user
     * (creator or assignee, or any task if {@code currentUser} is an ADMIN).
     */
    PagedTasksResponse getTasks(TaskFilterRequest filter, User currentUser, Pageable pageable);

    /**
     * Returns a single task by id if the user may see it.
     * Throws ResourceNotFoundException if not found, AccessDeniedException if forbidden.
     */
    TaskResponse getTaskById(Long id, User currentUser);

    /**
     * Updates an existing task.
     * Only the creator or an ADMIN may edit a task.
     */
    TaskResponse updateTask(Long id, TaskRequest request, User currentUser);

    /**
     * Permanently removes a task.
     * Only the creator or an ADMIN may delete a task.
     */
    void deleteTask(Long id, User currentUser);

    /**
     * Marks the task as COMPLETED.
     * A task that is already COMPLETED or CANCELLED cannot be completed again.
     */
    TaskResponse completeTask(Long id, User currentUser);

    /**
     * Marks the task as CANCELLED.
     * A task that is already COMPLETED or CANCELLED cannot be cancelled.
     */
    TaskResponse cancelTask(Long id, User currentUser);

    /**
     * Moves the task from TODO → IN_PROGRESS.
     * Only the assigned user or an ADMIN may start a task.
     * The task must be in TODO status.
     */
    TaskResponse startTask(Long id, User currentUser);
}

