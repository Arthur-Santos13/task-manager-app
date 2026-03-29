import { Component, OnInit, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { finalize } from 'rxjs';

import { TaskService } from '../../../core/services/task.service';
import { UserService } from '../../../core/services/user.service';
import { Task, TaskFilter, TaskPriority, TaskStatus } from '../../../core/models/task.model';
import { User } from '../../../core/models/user.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    NgClass,
    RouterLink,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatCardModule,
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
})
export class TaskListComponent implements OnInit {

  readonly loading    = signal(false);
  readonly users      = signal<User[]>([]);
  readonly dataSource = new MatTableDataSource<Task>([]);

  readonly displayedColumns = ['title', 'priority', 'status', 'assignee', 'dueDate', 'actions'];

  readonly priorityOptions: Array<{ value: TaskPriority; label: string }> = [
    { value: 'HIGH',   label: 'Alta'  },
    { value: 'MEDIUM', label: 'Média' },
    { value: 'LOW',    label: 'Baixa' },
  ];

  readonly statusOptions: Array<{ value: TaskStatus; label: string }> = [
    { value: 'TODO',        label: 'A fazer'      },
    { value: 'IN_PROGRESS', label: 'Em andamento' },
    { value: 'COMPLETED',   label: 'Concluída'    },
    { value: 'CANCELLED',   label: 'Cancelada'    },
  ];

  readonly filterForm = this.fb.group({
    title:        [''],
    description:  [''],
    priority:     [null as TaskPriority | null],
    status:       [null as TaskStatus | null],
    assigneeId:   [null as number | null],
    createdById:  [null as number | null],
    dueDateUntil: [null as Date | null],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly taskService: TaskService,
    private readonly userService: UserService,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.userService.getAll().subscribe(users => this.users.set(users));
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading.set(true);
    const fv = this.filterForm.value;

    const filter: TaskFilter = {};
    if (fv.title?.trim())       filter.title       = fv.title.trim();
    if (fv.description?.trim()) filter.description = fv.description.trim();
    if (fv.priority)            filter.priority    = fv.priority;
    if (fv.status)              filter.status      = fv.status;
    if (fv.assigneeId  != null) filter.assigneeId  = fv.assigneeId;
    if (fv.createdById != null) filter.createdById = fv.createdById;
    if (fv.dueDateUntil)        filter.dueDateUntil = this.formatDate(fv.dueDateUntil);

    this.taskService.getAll(filter)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: tasks => {
          // Default view: hide COMPLETED and CANCELLED unless status is explicitly filtered
          const visible = fv.status
            ? tasks
            : tasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
          this.dataSource.data = visible;
        },
        error: () => this.snackBar.open('Erro ao carregar tarefas.', 'OK', { duration: 3000 }),
      });
  }

  applyFilter(): void { this.loadTasks(); }

  clearFilter(): void {
    this.filterForm.reset();
    this.loadTasks();
  }

  // ── Actions ─────────────────────────────────────────────────────────

  onComplete(task: Task): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Concluir tarefa',
        message: `Marcar "${task.title}" como concluída?`,
        confirmLabel: 'Concluir',
        isDanger: false,
      },
      width: '400px',
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.taskService.complete(task.id).subscribe({
        next: () => { this.snackBar.open('Tarefa concluída!', 'OK', { duration: 3000 }); this.loadTasks(); },
        error: () => this.snackBar.open('Erro ao concluir tarefa.', 'OK', { duration: 3000 }),
      });
    });
  }

  onCancelTask(task: Task): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Cancelar tarefa',
        message: `Deseja cancelar a tarefa "${task.title}"?`,
        confirmLabel: 'Cancelar tarefa',
        isDanger: true,
      },
      width: '400px',
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.taskService.cancel(task.id).subscribe({
        next: () => { this.snackBar.open('Tarefa cancelada.', 'OK', { duration: 3000 }); this.loadTasks(); },
        error: () => this.snackBar.open('Erro ao cancelar tarefa.', 'OK', { duration: 3000 }),
      });
    });
  }

  onDelete(task: Task): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Excluir tarefa',
        message: `Excluir permanentemente "${task.title}"? Esta ação não pode ser desfeita.`,
        confirmLabel: 'Excluir',
        isDanger: true,
      },
      width: '400px',
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.taskService.delete(task.id).subscribe({
        next: () => { this.snackBar.open('Tarefa excluída.', 'OK', { duration: 3000 }); this.loadTasks(); },
        error: () => this.snackBar.open('Erro ao excluir tarefa.', 'OK', { duration: 3000 }),
      });
    });
  }

  // ── Label helpers ────────────────────────────────────────────────────

  statusLabel(status: TaskStatus): string {
    const map: Record<TaskStatus, string> = {
      TODO:        'A fazer',
      IN_PROGRESS: 'Em andamento',
      COMPLETED:   'Concluída',
      CANCELLED:   'Cancelada',
    };
    return map[status] ?? status;
  }

  priorityLabel(priority: TaskPriority): string {
    const map: Record<TaskPriority, string> = {
      HIGH:   'Alta',
      MEDIUM: 'Média',
      LOW:    'Baixa',
    };
    return map[priority] ?? priority;
  }

  canComplete(task: Task): boolean {
    return task.status === 'TODO' || task.status === 'IN_PROGRESS';
  }

  canCancelTask(task: Task): boolean {
    return task.status === 'TODO' || task.status === 'IN_PROGRESS';
  }

  // ── Utilities ────────────────────────────────────────────────────────

  private formatDate(date: Date): string {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  }
}
