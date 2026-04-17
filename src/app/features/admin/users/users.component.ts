import { Component, computed, signal } from '@angular/core';
import { NgClass, DatePipe } from '@angular/common';

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
  imports: [NgClass, DatePipe],
  templateUrl: './users.component.html',
})
export class AdminUsersComponent {
  readonly search = signal('');

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

  readonly stats = computed(() => ({
    total:    this.users().length,
    active:   this.users().filter(u => u.status === 'active').length,
    admins:   this.users().filter(u => u.role === 'admin' || u.role === 'manager').length,
  }));

  initials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  roleBadge(role: string): string {
    const map: Record<string, string> = {
      admin:   'bg-[#FBCBE3] text-zinc-800',
      manager: 'bg-[#FDD5AB] text-zinc-800',
      user:    'bg-[#AEE9F4] text-zinc-800',
    };
    return map[role] ?? 'bg-zinc-100 text-zinc-600';
  }

  toggleStatus(id: number): void {
    this.users.update(list =>
      list.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u)
    );
  }
}
