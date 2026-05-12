package com.taskmanager.dto;

import java.util.List;

/**
 * Paginated task list returned by {@code GET /api/tasks}.
 */
public record PagedTasksResponse(
        List<TaskResponse> content,
        long totalElements,
        int totalPages,
        int number,
        int size
) {
}
