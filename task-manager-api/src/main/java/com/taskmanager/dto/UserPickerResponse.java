package com.taskmanager.dto;

/**
 * Minimal user projection for assignee pickers (id + display name only).
 */
public record UserPickerResponse(Long id, String name) {
}
