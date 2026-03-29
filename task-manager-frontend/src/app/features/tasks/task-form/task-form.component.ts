import { Component, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';

import { TaskService } from '../../../core/services/task.service';
import { UserService } from '../../../core/services/user.service';
import { TaskPriority, TaskRequest, TaskStatus } from '../../../core/models/task.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss',
})
export class TaskFormComponent implements OnInit {

  isEditMode = false;
  taskId: number | null = null;

  readonly loading    = signal(false);
  readonly submitting = signal(false);
  readonly users      = signal<User[]>([]);

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

  readonly form = this.fb.nonNullable.group({
    title:       ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    assigneeId:  [null as number | null, Validators.required],
    priority:    ['MEDIUM' as TaskPriority, Validators.required],
    status:      ['TODO' as TaskStatus, Validators.required],
    dueDate:     [null as Date | null, Validators.required],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly taskService: TaskService,
    private readonly userService: UserService,
    private readonly snackBar: MatSnackBar,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.userService.getAll().subscribe(users => this.users.set(users));

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.taskId = Number(id);
      this.loadTask(this.taskId);
    }
  }

  get titleCtrl()      { return this.form.controls.title;      }
  get assigneeCtrl()   { return this.form.controls.assigneeId; }
  get priorityCtrl()   { return this.form.controls.priority;   }
  get statusCtrl()     { return this.form.controls.status;     }
  get dueDateCtrl()    { return this.form.controls.dueDate;    }

  private loadTask(id: number): void {
    this.loading.set(true);
    this.taskService.getById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: task => {
          this.form.patchValue({
            title:       task.title,
            description: task.description,
            assigneeId:  task.assignee?.id ?? null,
            priority:    task.priority,
            status:      task.status,
            dueDate:     task.dueDate ? this.parseDate(task.dueDate) : null,
          });
        },
        error: () => {
          this.snackBar.open('Erro ao carregar tarefa.', 'OK', { duration: 3000 });
          this.router.navigate(['/tasks']);
        },
      });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const fv = this.form.getRawValue();
    const request: TaskRequest = {
      title:       fv.title,
      description: fv.description,
      assigneeId:  fv.assigneeId!,
      priority:    fv.priority,
      status:      fv.status,
      dueDate:     fv.dueDate ? this.formatDate(fv.dueDate) : null,
    };

    this.submitting.set(true);
    const op$ = this.isEditMode
      ? this.taskService.update(this.taskId!, request)
      : this.taskService.create(request);

    op$.pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          const msg = this.isEditMode ? 'Tarefa atualizada!' : 'Tarefa criada com sucesso!';
          this.snackBar.open(msg, 'OK', { duration: 3000 });
          this.router.navigate(['/tasks']);
        },
        error: err => {
          const msg = err.error?.message ?? 'Erro ao salvar tarefa. Verifique os campos.';
          this.snackBar.open(msg, 'OK', { duration: 4000 });
        },
      });
  }

  private formatDate(date: Date): string {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  }

  private parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  }
}
