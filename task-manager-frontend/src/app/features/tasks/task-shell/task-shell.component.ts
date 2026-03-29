import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';
import { AppLogoComponent } from '../../../shared/components/app-logo.component';

@Component({
  selector: 'app-task-shell',
  standalone: true,
  imports: [RouterOutlet, MatButtonModule, MatIconModule, MatTooltipModule, AppLogoComponent],
  templateUrl: './task-shell.component.html',
  styleUrl: './task-shell.component.scss',
})
export class TaskShellComponent {

  readonly user = this.authService.currentUser;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}

