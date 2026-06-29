import { DatePipe, NgClass } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { User, UserRole, UserRolePayload } from '../../../core/dtos/auth';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { InputComponent } from '../../../shared/components/input/input.component';
import { SelectComponent, SelectOption } from '../../../shared/components/select/select.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { TableComponent } from '../../../shared/components/table/table.component';
import { ColumnComponent } from '../../../shared/components/table/column.component';

export interface AdminUser {
  id:        string;
  name:      string;
  email:     string;
  role:      UserRole;
  is_active: boolean;
  created_at: string;
}

@Component({
  standalone: true,
  selector: 'app-admin-users',
  imports: [NgClass, DatePipe, ReactiveFormsModule,
            InputComponent, SelectComponent,
            PaginationComponent, TableComponent, ColumnComponent],
  templateUrl: './users.component.html',
  providers: [MessageService],
})
export class AdminUsersComponent {
  private readonly authService = inject(AuthService);
  private readonly toast       = inject(ToastService);
  private readonly fb          = inject(FormBuilder);

  // L'API Flask ne fournit pas de liste d'utilisateurs.
  // On maintient localement les utilisateurs sur lesquels on a agi dans cette session.
  readonly users       = signal<AdminUser[]>([]);
  readonly search      = signal('');
  readonly page        = signal(1);
  readonly pageSize    = 8;
  readonly saving      = signal(false);

  // Formulaire de recherche par ID pour charger un utilisateur
  readonly lookupForm: FormGroup = this.fb.group({
    userId: ['', Validators.required],
  });

  readonly lookupLoading = signal(false);
  readonly lookupError   = signal<string | null>(null);

  // Formulaire de changement de rôle
  readonly roleForm: FormGroup = this.fb.group({
    userId: ['', Validators.required],
    role:   ['CLIENT', Validators.required],
  });

  readonly roleOptions: SelectOption<UserRole>[] = [
    { label: 'Enseignant',     value: 'CLIENT',  badge: 'bg-[#AEE9F4] text-zinc-800' },
    { label: 'Gestionnaire',   value: 'MANAGER', badge: 'bg-[#FDD5AB] text-zinc-800' },
    { label: 'Administrateur', value: 'ADMIN',   badge: 'bg-[#FBCBE3] text-zinc-800' },
  ];

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
    active: this.users().filter(u => u.is_active).length,
    admins: this.users().filter(u => u.role === 'ADMIN' || u.role === 'MANAGER').length,
  }));

  // ── Recherche par ID ────────────────────────────────────────────────────────

  lookupUser(): void {
    const userId = this.lookupForm.value.userId as string;
    if (!userId) return;
    this.lookupLoading.set(true);
    this.lookupError.set(null);
    this.authService.loadProfile().subscribe({
      next: (u) => {
        this.mergeUser(u);
        this.lookupLoading.set(false);
        this.lookupForm.reset();
      },
      error: () => {
        this.lookupLoading.set(false);
        this.lookupError.set('Utilisateur introuvable ou accès refusé.');
      },
    });
  }

  applyRoleChange(): void {
    const { userId, role } = this.roleForm.value;
    if (!userId || !role) return;
    this.changeRole(userId as string, role as UserRole);
    this.roleForm.reset({ role: 'CLIENT' });
  }

  // ── Activer / Désactiver ────────────────────────────────────────────────────

  deactivateUser(user: AdminUser): void {
    this.saving.set(true);
    this.authService.deactivateUser(user.id).subscribe({
      next: (updated) => {
        this.mergeUser(updated);
        this.saving.set(false);
        this.toast.showSuccess(`${user.name} a été désactivé.`);
      },
      error: () => {
        this.saving.set(false);
        this.toast.showError('Impossible de désactiver cet utilisateur.');
      },
    });
  }

  activateUser(user: AdminUser): void {
    this.saving.set(true);
    this.authService.activateUser(user.id).subscribe({
      next: (updated) => {
        this.mergeUser(updated);
        this.saving.set(false);
        this.toast.showSuccess(`${user.name} a été réactivé.`);
      },
      error: () => {
        this.saving.set(false);
        this.toast.showError('Impossible de réactiver cet utilisateur.');
      },
    });
  }

  // ── Changer le rôle ─────────────────────────────────────────────────────────

  changeRole(userId: string, role: UserRole): void {
    this.saving.set(true);
    const payload: UserRolePayload = { role };
    this.authService.changeUserRole(userId, payload).subscribe({
      next: (updated) => {
        this.mergeUser(updated);
        this.saving.set(false);
        this.toast.showSuccess('Rôle mis à jour.');
      },
      error: () => {
        this.saving.set(false);
        this.toast.showError('Impossible de modifier le rôle.');
      },
    });
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  roleBadge(role: string): string {
    return this.roleOptions.find(o => o.value === role)?.badge ?? 'bg-zinc-100 text-zinc-600';
  }

  roleLabel(role: string): string {
    return this.roleOptions.find(o => o.value === role)?.label ?? role;
  }

  initials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase() || '?';
  }

  private mergeUser(updated: User): void {
    const mapped: AdminUser = {
      id:         updated.id,
      name:       updated.name,
      email:      updated.email,
      role:       updated.role,
      is_active:  updated.is_active,
      created_at: updated.created_at,
    };

    this.users.update(list => {
      const exists = list.some(u => u.id === mapped.id);
      return exists
        ? list.map(u => u.id === mapped.id ? mapped : u)
        : [mapped, ...list];
    });
  }
}
