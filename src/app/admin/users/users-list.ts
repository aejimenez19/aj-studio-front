import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.types';
import { ApiError } from '../../core/models/api-error.types';
import { UserFormModal } from './user-form-modal';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [UserFormModal],
  templateUrl: './users-list.html',
  styleUrl: './users-list.css',
})
export class UsersListComponent implements OnInit {
  private readonly userService = inject(UserService);

  users = signal<User[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  showModal = signal(false);
  editingUser = signal<User | null>(null);
  disablingUserIds = signal<Set<number>>(new Set());

  currentPage = signal(0);
  pageSize = signal(5);
  totalPages = signal(0);
  totalElements = signal(0);
  isFirst = signal(true);
  isLast = signal(true);

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.userService.getAll(this.currentPage(), this.pageSize()).subscribe({
      next: page => {
        if (page.content.length === 0 && !page.first) {
          this.currentPage.set(page.number - 1);
          this.loadUsers();
          return;
        }
        this.users.set(page.content);
        this.totalPages.set(page.totalPages);
        this.totalElements.set(page.totalElements);
        this.isFirst.set(page.first);
        this.isLast.set(page.last);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        const apiError = err.error as ApiError;
        this.error.set(apiError?.message || 'Error al cargar los usuarios');
        this.loading.set(false);
      },
    });
  }

  showCreateModal(): void {
    this.editingUser.set(null);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingUser.set(null);
  }

  onUserCreated(): void {
    this.showModal.set(false);
    this.editingUser.set(null);
    this.loadUsers();
  }

  onUserUpdated(): void {
    this.showModal.set(false);
    this.editingUser.set(null);
    this.loadUsers();
  }

  disableUser(user: User): void {
    if (!window.confirm(`¿Desactivar al usuario "${user.fullName}"?`)) return;

    this.disablingUserIds.update(s => new Set(s).add(user.id));
    this.error.set(null);

    this.userService.disable(user.id).pipe(
      finalize(() => {
        this.disablingUserIds.update(s => {
          const next = new Set(s);
          next.delete(user.id);
          return next;
        });
      }),
    ).subscribe({
      next: () => this.loadUsers(),
      error: (err: HttpErrorResponse) => {
        const apiError = err.error as ApiError;
        this.error.set(apiError?.message || 'Error al desactivar el usuario');
      },
    });
  }

  editUser(user: User): void {
    this.editingUser.set(user);
    this.showModal.set(true);
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages()) return;
    this.currentPage.set(page);
    this.loadUsers();
  }

  nextPage(): void {
    if (!this.isLast()) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  prevPage(): void {
    if (!this.isFirst()) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  changePageSize(size: string | number): void {
    this.pageSize.set(Number(size));
    this.currentPage.set(0);
    this.loadUsers();
  }

  roleNames(roles: { name: string }[]): string {
    return roles.map(r => r.name).join(', ');
  }
}
