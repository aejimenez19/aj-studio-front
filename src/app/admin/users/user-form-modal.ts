import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { ApiError } from '../../core/models/api-error.types';

@Component({
  selector: 'app-user-form-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './user-form-modal.html',
  styleUrl: './user-form-modal.css',
})
export class UserFormModal {
  private readonly userService = inject(UserService);

  fullName = signal('');
  email = signal('');
  password = signal('');
  selectedRole = signal('ROLE_ADMIN');
  saving = signal(false);
  error = signal<string | null>(null);

  created = output<void>();
  closed = output<void>();

  onSubmit(): void {
    if (!this.fullName() || !this.email() || !this.password()) {
      this.error.set('Todos los campos son obligatorios');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    this.userService
      .create({
        fullName: this.fullName(),
        email: this.email(),
        password: this.password(),
        role: this.selectedRole(),
      })
      .subscribe({
        next: () => {
          this.created.emit();
        },
        error: (err: HttpErrorResponse) => {
          const apiError = err.error as ApiError;
          this.error.set(apiError?.message || 'Error al crear el usuario');
          this.saving.set(false);
        },
      });
  }

  close(): void {
    this.closed.emit();
  }
}
