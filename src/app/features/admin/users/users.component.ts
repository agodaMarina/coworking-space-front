import { Component, OnInit, computed, signal } from '@angular/core';
import { NgClass, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../shared/components/input/input.component';
import { SelectComponent, SelectOption } from '../../../shared/components/select/select.component';
import { ToggleComponent } from '../../../shared/components/toggle/toggle.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../core/services/toast.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { TableComponent } from '../../../shared/components/table/table.component';
import { ColumnComponent } from '../../../shared/components/table/column.component';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth/auth.service';
import { AdminUserPayload, AdminUserUpdatePayload, User } from '../../../core/dtos/auth';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'client';
  status: 'active' | 'inactive';
  joined: string;
}

@Component({
  standalone: true,
  selector: 'app-admin-users',
  imports: [NgClass, DatePipe, ReactiveFormsModule, InputComponent, SelectComponent, ToggleComponent, ConfirmDialogComponent, PaginationComponent, TableComponent, ColumnComponent],
  templateUrl: './users.component.html',
  providers: [MessageService]
})
export class AdminUsersComponent implements OnInit {
  readonly search    = signal('');
  readonly page      = signal(1);
  readonly pageSize  = 8;
  readonly showModal = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly pendingDeleteId = signal<string | null>(null);
  readonly loading   = signal(false);
  readonly saving    = signal(false);

  readonly form: FormGroup;

  readonly roleOptions: SelectOption<'admin' | 'manager' | 'client'>[] = [
    { label: 'Client',  value: 'client',  badge: 'bg-[#AEE9F4] text-zinc-800' },
    { label: 'Manager', value: 'manager', badge: 'bg-[#FDD5AB] text-zinc-800' },
    { label: 'Admin',   value: 'admin',   badge: 'bg-[#FBCBE3] text-zinc-800' },
  ];

  readonly users = signal<AdminUser[]>([]);

  readonly filtered = computed(() => {
    const q = this.search().toLowerCase();
    return q
      ? this.users().filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      : this.users();
  });

  readonly paginated = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  readonly stats = computed(() => ({
    total:  this.users().length,
    active: this.users().filter(u => u.status === 'active').length,
    admins: this.users().filter(u => u.role === 'admin' || u.role === 'manager').length,
  }));

  readonly modalTitle   = computed(() => this.editingId() !== null ? 'Edit user' : 'New user');
  readonly submitLabel  = computed(() => this.editingId() !== null ? 'Save changes' : 'Create user');
  readonly isCreating   = computed(() => this.editingId() === null);

  constructor(private fb: FormBuilder, private toast: ToastService, private authService: AuthService) {
    this.form = this.fb.group({
      name:     ['', Validators.required],
      email:    ['', [Validators.required, Validators.email]],
      role:     ['client', Validators.required],
      phone:    [''],
      status:   [true],
      password: [''],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.loading.set(true);
    this.authService.getAdminUsers().subscribe({
      next: (users) => {
        this.users.set(users.map(u => this.mapUser(u)));
        this.loading.set(false);
      },
      error: () => {
        this.toast.showError('Failed to load users.');
        this.loading.set(false);
      }
    });
  }

  private mapUser(u: User): AdminUser {
    const first = u?.first_name ?? '';
    const last  = u?.last_name  ?? '';
    return {
      id:     u?.id     ?? '',
      name:   (u?.full_name || `${first} ${last}`.trim() || u?.email) ?? '',
      email:  u?.email  ?? '',
      phone:  u?.phone  ?? undefined,
      role:   (u?.role as 'admin' | 'manager' | 'client') || 'client',
      status: u?.is_active !== false ? 'active' : 'inactive',
      joined: u?.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    };
  }

  initials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase() || '?';
  }

  roleBadge(role: string): string {
    return this.roleOptions.find(o => o.value === role)?.badge ?? 'bg-zinc-100 text-zinc-600';
  }

  toggleStatus(id: string): void {
    this.users.update(list =>
      list.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u)
    );
    this.toast.showSuccess('User status updated.');
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ role: 'client', status: true, phone: '' });
    this.form.get('password')?.setValidators(Validators.required);
    this.form.get('password')?.updateValueAndValidity();
    this.showModal.set(true);
  }

  openEdit(u: AdminUser): void {
    this.editingId.set(u.id);
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
    this.form.patchValue({ ...u, status: u.status === 'active' });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveForm(): void {
    if (this.form.invalid) return;
    const v = this.form.value;
    const id = this.editingId();
    const names = v.name.trim().split(' ');
    const firstName = names[0] || '';
    const lastName  = names.slice(1).join(' ') || '';

    if (id !== null) {
      const payload: AdminUserUpdatePayload = {
        first_name: firstName,
        last_name:  lastName,
        email:      v.email,
        username:   v.email.split('@')[0],
        role:       v.role,
        ...(v.phone ? { phone: v.phone } : {}),
      };
      this.saving.set(true);
      this.authService.updateAdminUser(id, payload).subscribe({
        next: () => {
          this.loadUsers();
          this.toast.showSuccess('User updated successfully.');
          this.closeModal();
          this.saving.set(false);
        },
        error: (err) => {
          const msg = err.error && typeof err.error === 'object'
            ? (Object.values(err.error) as string[][]).flat().join(' ')
            : 'Error updating user.';
          this.toast.showError(msg);
          this.saving.set(false);
        }
      });
    } else {
      const payload: AdminUserPayload = {
        first_name:       firstName,
        last_name:        lastName,
        username:         v.email.split('@')[0],
        email:            v.email,
        password:         v.password,
        password_confirm: v.password,
        role:             v.role,
        ...(v.phone ? { phone: v.phone } : {}),
      };
      this.saving.set(true);
      this.authService.createAdminUser(payload).subscribe({
        next: () => {
          this.loadUsers();
          this.toast.showSuccess('User created successfully.');
          this.closeModal();
          this.saving.set(false);
        },
        error: (err) => {
          const msg = err.error && typeof err.error === 'object'
            ? (Object.values(err.error) as string[][]).flat().join(' ')
            : 'Error creating user.';
          this.toast.showError(msg);
          this.saving.set(false);
        }
      });
    }
  }

  askDelete(id: string): void {
    this.pendingDeleteId.set(id);
  }

  confirmDelete(): void {
    const id = this.pendingDeleteId();
    if (id === null) return;
    this.authService.deleteAdminUser(id).subscribe({
      next: () => {
        this.users.update(list => list.filter(u => u.id !== id));
        this.pendingDeleteId.set(null);
        this.toast.showSuccess('User deleted.');
      },
      error: () => {
        this.pendingDeleteId.set(null);
        this.toast.showError('Unable to delete user.');
      }
    });
  }

  cancelDelete(): void {
    this.pendingDeleteId.set(null);
  }
}
