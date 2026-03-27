package com.taskmanager.entity;

public enum TaskStatus {
    /** Initial state — task not yet started. */
    TODO,

    /** Em andamento — task is being worked on. */
    IN_PROGRESS,

    /** Concluída — task has been completed. */
    COMPLETED,

    /** Cancelada — task has been cancelled. */
    CANCELLED
}
