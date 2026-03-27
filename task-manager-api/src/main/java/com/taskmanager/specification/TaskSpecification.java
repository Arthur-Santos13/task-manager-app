package com.taskmanager.specification;

import com.taskmanager.dto.TaskFilterRequest;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.TaskStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * JPA Criteria-based specification that translates a {@link TaskFilterRequest}
 * into a dynamic WHERE clause for the {@code tasks} table.
 */
public class TaskSpecification {

    private TaskSpecification() {
        // utility class
    }

    /**
     * Builds a {@link Specification} from the given filter.
     * Every non-null / non-blank field in the filter adds a predicate.
     * All predicates are combined with AND.
     *
     * <p><b>dueDateUntil rule ("até:"):</b> when provided, returns tasks whose
     * {@code dueDate ≤ dueDateUntil} AND whose status is not COMPLETED or CANCELLED
     * (i.e. tasks that are still active and need attention before that date).
     */
    public static Specification<Task> withFilters(TaskFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Title — partial, case-insensitive
            if (filter.title() != null && !filter.title().isBlank()) {
                predicates.add(cb.like(
                        cb.lower(root.get("title")),
                        "%" + filter.title().toLowerCase() + "%"));
            }

            // Description — partial, case-insensitive
            if (filter.description() != null && !filter.description().isBlank()) {
                predicates.add(cb.like(
                        cb.lower(root.get("description")),
                        "%" + filter.description().toLowerCase() + "%"));
            }

            // Assignee (responsible user)
            if (filter.assigneeId() != null) {
                predicates.add(cb.equal(root.get("assignee").get("id"), filter.assigneeId()));
            }

            // Creator
            if (filter.createdById() != null) {
                predicates.add(cb.equal(root.get("createdBy").get("id"), filter.createdById()));
            }

            // Priority
            if (filter.priority() != null) {
                predicates.add(cb.equal(root.get("priority"), filter.priority()));
            }

            // Status — explicit status filter
            if (filter.status() != null) {
                predicates.add(cb.equal(root.get("status"), filter.status()));
            }

            // "Até:" deadline filter — only when dueDateUntil is provided
            // Returns tasks that:
            //   1. Are still active (not COMPLETED and not CANCELLED)
            //   2. Have dueDate on or before the informed date
            if (filter.dueDateUntil() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("dueDate"), filter.dueDateUntil()));
                predicates.add(cb.notEqual(root.get("status"), TaskStatus.COMPLETED));
                predicates.add(cb.notEqual(root.get("status"), TaskStatus.CANCELLED));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

