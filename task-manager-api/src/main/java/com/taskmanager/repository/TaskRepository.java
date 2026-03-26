package com.taskmanager.repository;

import com.taskmanager.entity.Task;
import com.taskmanager.entity.TaskPriority;
import com.taskmanager.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {

    /** All tasks where the given user is the responsible person. */
    List<Task> findByAssigneeId(Long assigneeId);

    /** All tasks created by the given user. */
    List<Task> findByCreatedById(Long createdById);

    List<Task> findByAssigneeIdAndStatus(Long assigneeId, TaskStatus status);

    List<Task> findByAssigneeIdAndPriority(Long assigneeId, TaskPriority priority);

    List<Task> findByStatus(TaskStatus status);

    List<Task> findByPriority(TaskPriority priority);
}
