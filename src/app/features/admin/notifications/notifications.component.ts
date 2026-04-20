import { Component, computed, signal } from '@angular/core';
import { NgClass, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../shared/components/input/input.component';
import { TextareaComponent } from '../../../shared/components/textarea/textarea.component';
import { SelectComponent, SelectOption } from '../../../shared/components/select/select.component';
import { ToggleComponent } from '../../../shared/components/toggle/toggle.component';
import { DatePickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../core/services/toast.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { TableComponent } from '../../../shared/components/table/table.component';
import { ColumnComponent } from '../../../shared/components/table/column.component';
import { MessageService } from 'primeng/api';

export interface AdminNotification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'promo' | 'system';
  target: string;
  date: string;
  status: 'sent' | 'scheduled' | 'failed';
}

@Component({
  standalone: true,
  selector: 'app-admin-notifications',
  imports: [NgClass, DatePipe, ReactiveFormsModule, InputComponent, TextareaComponent, SelectComponent, ToggleComponent, DatePickerComponent, ConfirmDialogComponent, PaginationComponent, TableComponent, ColumnComponent],
  templateUrl: './notifications.component.html',
  providers:[MessageService]
})
export class AdminNotificationsComponent {
  readonly showModal = signal(false);
  readonly pendingDeleteId = signal<number | null>(null);
  readonly page     = signal(1);
  readonly pageSize = 8;

  readonly form: FormGroup;

  readonly typeOptions: SelectOption<'info' | 'warning' | 'promo' | 'system'>[] = [
    { label: 'Info',    value: 'info',    badge: 'bg-[#AEE9F4] text-zinc-800' },
    { label: 'Warning', value: 'warning', badge: 'bg-[#FDD5AB] text-zinc-800' },
    { label: 'Promo',   value: 'promo',   badge: 'bg-[#CEF09D] text-zinc-800' },
    { label: 'System',  value: 'system',  badge: 'bg-[#E2F89C] text-zinc-800' },
  ];

  readonly targetOptions: SelectOption<string>[] = [
    { label: 'All users',         value: 'all'    },
    { label: 'Admins & managers', value: 'admins' },
    { label: 'Specific user…',    value: 'custom' },
  ];

  readonly notifications = signal<AdminNotification[]>([
    { id: 1, title: 'Maintenance scheduled', message: 'Open Space A will be closed Apr 20 for maintenance.', type: 'warning', target: 'all',         date: '2024-04-10', status: 'sent'      },
    { id: 2, title: 'New spaces available',  message: 'Two new private offices are now open for booking.',   type: 'info',    target: 'all',         date: '2024-04-12', status: 'sent'      },
    { id: 3, title: 'Spring promo — 20% off',message: 'Book any space this April and get 20% off.',          type: 'promo',   target: 'all',         date: '2024-04-15', status: 'scheduled' },
    { id: 4, title: 'System update tonight', message: 'The platform will be unavailable 2–3 AM.',            type: 'system',  target: 'admins',      date: '2024-04-08', status: 'sent'      },
    { id: 5, title: 'Payment reminder',      message: 'Reminder: invoice INV-0002 is still pending.',        type: 'warning', target: 'Bob Johnson', date: '2024-04-14', status: 'failed'    },
  ]);

  readonly paginated = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.notifications().slice(start, start + this.pageSize);
  });

  readonly stats = computed(() => ({
    sent:      this.notifications().filter(n => n.status === 'sent').length,
    scheduled: this.notifications().filter(n => n.status === 'scheduled').length,
    failed:    this.notifications().filter(n => n.status === 'failed').length,
  }));

  readonly isScheduled = computed(() => !this.form.get('sendNow')?.value);

  constructor(private fb: FormBuilder, private toast: ToastService) {
    this.form = this.fb.group({
      title:      ['', Validators.required],
      message:    ['', Validators.required],
      type:       ['info', Validators.required],
      target:     ['all', Validators.required],
      customUser: [''],
      sendNow:    [true],
      date:       [''],
    });
  }

  typeBadge(type: string): string {
    return this.typeOptions.find(o => o.value === type)?.badge ?? 'bg-zinc-100 text-zinc-600';
  }

  statusBadge(status: string): string {
    const map: Record<string, string> = {
      sent:      'bg-[#CEF09D] text-zinc-800',
      scheduled: 'bg-[#FDD5AB] text-zinc-800',
      failed:    'bg-[#FBCBE3] text-zinc-800',
    };
    return map[status] ?? 'bg-zinc-100 text-zinc-600';
  }

  openCreate(): void {
    this.form.reset({ type: 'info', target: 'all', sendNow: true });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveForm(): void {
    if (this.form.invalid) return;
    const v = this.form.value;
    const target = v.target === 'custom' ? (v.customUser || 'custom') : v.target;
    const sendNow: boolean = v.sendNow;
    const status: 'sent' | 'scheduled' = sendNow ? 'sent' : 'scheduled';
    const date = sendNow ? new Date().toISOString().split('T')[0] : (v.date || new Date().toISOString().split('T')[0]);

    const newId = Math.max(0, ...this.notifications().map(n => n.id)) + 1;
    this.notifications.update(list => [...list, {
      id: newId, title: v.title, message: v.message,
      type: v.type, target, date, status,
    }]);

    this.toast.showSuccess(sendNow ? 'Notification sent.' : 'Notification scheduled.');
    this.closeModal();
  }

  askDelete(id: number): void {
    this.pendingDeleteId.set(id);
  }

  confirmDelete(): void {
    const id = this.pendingDeleteId();
    if (id === null) return;
    this.notifications.update(list => list.filter(n => n.id !== id));
    this.pendingDeleteId.set(null);
    this.toast.showSuccess('Notification deleted.');
  }

  cancelDelete(): void {
    this.pendingDeleteId.set(null);
  }
}
