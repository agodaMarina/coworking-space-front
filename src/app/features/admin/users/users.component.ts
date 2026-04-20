import { Component, computed, signal } from '@angular/core';
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

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive';
  joined: string;
}

@Component({
  standalone: true,
  selector: 'app-admin-users',
  imports: [NgClass, DatePipe, ReactiveFormsModule, InputComponent, SelectComponent, ToggleComponent, ConfirmDialogComponent, PaginationComponent, TableComponent, ColumnComponent],
  templateUrl: './users.component.html',
  providers:[MessageService]
})
export class AdminUsersComponent {
  readonly search   = signal('');
  readonly page     = signal(1);
  readonly pageSize = 8;
  readonly showModal = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly pendingDeleteId = signal<number | null>(null);

  readonly form: FormGroup;

  readonly roleOptions: SelectOption<'admin' | 'manager' | 'user'>[] = [
    { label: 'User',    value: 'user',    badge: 'bg-[#AEE9F4] text-zinc-800' },
    { label: 'Manager', value: 'manager', badge: 'bg-[#FDD5AB] text-zinc-800' },
    { label: 'Admin',   value: 'admin',   badge: 'bg-[#FBCBE3] text-zinc-800' },
  ];

  readonly users = signal<AdminUser[]>([
    { id: 1, name: 'Alice Martin',  email: 'alice@cowork.io',   role: 'admin',   status: 'active',   joined: '2024-01-15' },
    { id: 2, name: 'Bob Johnson',   email: 'bob@gmail.com',     role: 'user',    status: 'active',   joined: '2024-02-20' },
    { id: 3, name: 'Carol White',   email: 'carol@gmail.com',   role: 'user',    status: 'inactive', joined: '2024-03-05' },
    { id: 4, name: 'David Brown',   email: 'david@outlook.com', role: 'user',    status: 'active',   joined: '2024-03-18' },
    { id: 5, name: 'Eva Green',     email: 'eva@cowork.io',     role: 'manager', status: 'active',   joined: '2024-04-02' },
    { id: 6, name: 'Frank Taylor',  email: 'frank@gmail.com',   role: 'user',    status: 'active',   joined: '2024-04-10' },
    { id: 7, name: 'Grace Wilson',  email: 'grace@outlook.com', role: 'user',    status: 'inactive', joined: '2024-04-15' },
  ]);

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

  readonly modalTitle = computed(() => this.editingId() !== null ? 'Edit user' : 'New user');
  readonly submitLabel = computed(() => this.editingId() !== null ? 'Save changes' : 'Create user');
  readonly isCreating = computed(() => this.editingId() === null);

  constructor(private fb: FormBuilder, private toast: ToastService) {
    this.form = this.fb.group({
      name:     ['', Validators.required],
      email:    ['', [Validators.required, Validators.email]],
      role:     ['user', Validators.required],
      status:   [true],
      password: [''],
    });
  }

  initials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  roleBadge(role: string): string {
    return this.roleOptions.find(o => o.value === role)?.badge ?? 'bg-zinc-100 text-zinc-600';
  }

  toggleStatus(id: number): void {
    this.users.update(list =>
      list.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u)
    );
    this.toast.showSuccess('User status updated.');
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ role: 'user', status: true });
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
    const status: 'active' | 'inactive' = v.status ? 'active' : 'inactive';
    const id = this.editingId();

    if (id !== null) {
      this.users.update(list =>
        list.map(u => u.id === id ? { ...u, name: v.name, email: v.email, role: v.role, status } : u)
      );
      this.toast.showSuccess('User updated successfully.');
    } else {
      const newId = Math.max(0, ...this.users().map(u => u.id)) + 1;
      this.users.update(list => [...list, {
        id: newId, name: v.name, email: v.email,
        role: v.role, status,
        joined: new Date().toISOString().split('T')[0],
      }]);
      this.toast.showSuccess('User created successfully.');
    }
    this.closeModal();
  }

  askDelete(id: number): void {
    this.pendingDeleteId.set(id);
  }

  confirmDelete(): void {
    const id = this.pendingDeleteId();
    if (id === null) return;
    this.users.update(list => list.filter(u => u.id !== id));
    this.pendingDeleteId.set(null);
    this.toast.showSuccess('User deleted.');
  }

  cancelDelete(): void {
    this.pendingDeleteId.set(null);
  }
}
