package com.taskmanager.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.taskmanager.entity.TaskPriority;
import com.taskmanager.entity.TaskStatus;

import java.time.LocalDate;


public record TaskFilterRequest(

        /** Partial, case-insensitive match on the task title. */
        String title,

        /** Partial, case-insensitive match on the task description. */
        String description,

        /** Filter by the responsible user (assignee). */
        Long assigneeId,

        /** Filter by the user who created the task. */
        Long createdById,

        /** Filter by priority level. */
        TaskPriority priority,

        /** Filter by status. When omitted together with dueDateUntil, all statuses are returned. */
        TaskStatus status,

        /**
         * "until" deadline filter.
         * Returns tasks whose {@code dueDate} is on or before this date
         * AND whose status is neither COMPLETED nor CANCELLED.
         */
        @JsonFormat(pattern = "dd/MM/yyyy") LocalDate dueDateUntil
) {
}

