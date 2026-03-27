package com.taskmanager.service;

import com.taskmanager.dto.TaskFilterRequest;
import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.entity.User;

import java.util.List;

public interface TaskService {

    /** Creates a new task. The authenticated user is recorded as the creator. */
    TaskResponse createTask(TaskRequest request, User currentUser);

    /** Returns all tasks that match the given filter. All fields are optional. */
    List<TaskResponse> getTasks(TaskFilterRequest filter);

    /** Returns a single task by id. Throws ResourceNotFoundException if not found. */
    TaskResponse getTaskById(Long id);

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
}

