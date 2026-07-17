import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, signal, computed, effect, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { User, UpdateUserRequest } from '../../core/models/user.types';
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

  user = input<User | null>(null);

  fullName = signal('');
  email = signal('');
  password = signal('');
  selectedRole = signal('ROLE_ADMIN');
  saving = signal(false);
  error = signal<string | null>(null);

  created = output<void>();
  updated = output<void>();
  closed = output<void>();

  isEdit = computed(() => this.user() !== null);

  constructor() {
    effect(() => {
      const u = this.user();
      if (u) {
        this.fullName.set(u.fullName);
        this.email.set(u.email);
        const roleName = u.roles.length > 0 ? u.roles[0].name : 'ROLE_ADMIN';
        this.selectedRole.set(roleName);
        this.password.set('');
        this.error.set(null);
      } else {
        this.fullName.set('');
        this.email.set('');
        this.password.set('');
        this.selectedRole.set('ROLE_ADMIN');
        this.error.set(null);
      }
    });
  }

  onSubmit(): void {
    if (!this.fullName() || !this.email()) {
      this.error.set('El nombre y el correo son obligatorios');
      return;
    }

    if (!this.isEdit() && !this.password()) {
      this.error.set('Todos los campos son obligatorios');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const u = this.user();
    if (u) {
      const body: UpdateUserRequest = {
        fullName: this.fullName(),
        email: this.email(),
        role: this.selectedRole(),
      };
      if (this.password()) {
        body.password = this.password();
      }

      this.userService.update(u.id, body).subscribe({
        next: () => {
          this.updated.emit();
        },
        error: (err: HttpErrorResponse) => {
          const apiError = err.error as ApiError;
          this.error.set(apiError?.message || 'Error al actualizar el usuario');
          this.saving.set(false);
        },
      });
    } else {
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
  }

  close(): void {
    this.closed.emit();
  }
}
