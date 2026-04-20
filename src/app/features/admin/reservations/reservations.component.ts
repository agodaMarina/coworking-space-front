import { Component, computed, signal } from '@angular/core';
import { NgClass, CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../shared/components/input/input.component';
import { TextareaComponent } from '../../../shared/components/textarea/textarea.component';
import { SelectComponent, SelectOption } from '../../../shared/components/select/select.component';
import { DatePickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../core/services/toast.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { TableComponent } from '../../../shared/components/table/table.component';
import { ColumnComponent } from '../../../shared/components/table/column.component';
import { MessageService } from 'primeng/api';

export interface AdminReservation {
  id: number;
  user: string;
  space: string;
  start: string;
  end: string;
  billing: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  amount: number;
  notes?: string;
}

@Component({
  standalone: true,
  selector: 'app-admin-reservations',
  imports: [NgClass, CurrencyPipe, DatePipe, ReactiveFormsModule, InputComponent, TextareaComponent, SelectComponent, DatePickerComponent, ConfirmDialogComponent, PaginationComponent, TableComponent, ColumnComponent],
  templateUrl: './reservations.component.html',
  providers:[MessageService]
})
export class AdminReservationsComponent {
  readonly activeFilter = signal<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');
  readonly page        = signal(1);
  readonly pageSize    = 8;
  readonly showModal   = signal(false);
  readonly editingId   = signal<number | null>(null);
  readonly pendingDeleteId = signal<number | null>(null);
  readonly detailId    = signal<number | null>(null);

  readonly form: FormGroup;

  readonly filters = [
    { key: 'all' as const,       label: 'All'       },
    { key: 'confirmed' as const, label: 'Confirmed' },
    { key: 'pending' as const,   label: 'Pending'   },
    { key: 'cancelled' as const, label: 'Cancelled' },
  ];

  readonly userOptions: SelectOption<string>[] = [
    { label: 'Alice Martin',  value: 'Alice Martin'  },
    { label: 'Bob Johnson',   value: 'Bob Johnson'   },
    { label: 'Carol White',   value: 'Carol White'   },
    { label: 'David Brown',   value: 'David Brown'   },
    { label: 'Eva Green',     value: 'Eva Green'     },
    { label: 'Frank Taylor',  value: 'Frank Taylor'  },
    { label: 'Grace Wilson',  value: 'Grace Wilson'  },
  ];

  readonly spaceOptions: SelectOption<string>[] = [
    { label: 'Open Space A',     value: 'Open Space A'     },
    { label: 'Meeting Room 1',   value: 'Meeting Room 1'   },
    { label: 'Private Office 3', value: 'Private Office 3' },
    { label: 'Hot Desk B',       value: 'Hot Desk B'       },
    { label: 'Conference Hall',  value: 'Conference Hall'  },
    { label: 'Open Space B',     value: 'Open Space B'     },
  ];

  readonly billingOptions: SelectOption<string>[] = [
    { label: 'Hourly',  value: 'Hourly'  },
    { label: 'Daily',   value: 'Daily'   },
    { label: 'Monthly', value: 'Monthly' },
  ];

  readonly statusOptions: SelectOption<'confirmed' | 'pending' | 'cancelled'>[] = [
    { label: 'Confirmed', value: 'confirmed', badge: 'bg-[#CEF09D] text-zinc-800' },
    { label: 'Pending',   value: 'pending',   badge: 'bg-[#FDD5AB] text-zinc-800' },
    { label: 'Cancelled', value: 'cancelled', badge: 'bg-zinc-100 text-zinc-500'  },
  ];

  readonly reservations = signal<AdminReservation[]>([
    { id: 1, user: 'Alice Martin',  space: 'Open Space A',     start: '2024-04-10', end: '2024-04-12', billing: 'Daily',   status: 'confirmed', amount: 240  },
    { id: 2, user: 'Bob Johnson',   space: 'Meeting Room 1',   start: '2024-04-15', end: '2024-04-15', billing: 'Hourly',  status: 'pending',   amount: 120  },
    { id: 3, user: 'Carol White',   space: 'Private Office 3', start: '2024-04-01', end: '2024-04-30', billing: 'Monthly', status: 'confirmed', amount: 1200 },
    { id: 4, user: 'David Brown',   space: 'Hot Desk B',       start: '2024-04-14', end: '2024-04-14', billing: 'Daily',   status: 'cancelled', amount: 80   },
    { id: 5, user: 'Eva Green',     space: 'Conference Hall',  start: '2024-04-20', end: '2024-04-20', billing: 'Hourly',  status: 'pending',   amount: 350  },
    { id: 6, user: 'Frank Taylor',  space: 'Open Space B',     start: '2024-04-22', end: '2024-04-26', billing: 'Daily',   status: 'confirmed', amount: 400  },
    { id: 7, user: 'Grace Wilson',  space: 'Hot Desk A',       start: '2024-04-08', end: '2024-04-08', billing: 'Daily',   status: 'cancelled', amount: 80   },
  ]);

  readonly filtered = computed(() => {
    const f = this.activeFilter();
    return f === 'all' ? this.reservations() : this.reservations().filter(r => r.status === f);
  });

  readonly paginated = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  readonly stats = computed(() => ({
    total:     this.reservations().length,
    confirmed: this.reservations().filter(r => r.status === 'confirmed').length,
    pending:   this.reservations().filter(r => r.status === 'pending').length,
    cancelled: this.reservations().filter(r => r.status === 'cancelled').length,
  }));

  readonly modalTitle  = computed(() => this.editingId() !== null ? 'Edit reservation' : 'New reservation');
  readonly submitLabel = computed(() => this.editingId() !== null ? 'Save changes' : 'Create reservation');
  readonly detail      = computed(() => this.reservations().find(r => r.id === this.detailId()) ?? null);

  constructor(private fb: FormBuilder, private toast: ToastService) {
    this.form = this.fb.group({
      user:    ['', Validators.required],
      space:   ['', Validators.required],
      start:   ['', Validators.required],
      end:     ['', Validators.required],
      billing: ['Daily', Validators.required],
      status:  ['pending', Validators.required],
      amount:  [null],
      notes:   [''],
    });
  }

  statusBadge(status: string): string {
    return this.statusOptions.find(o => o.value === status)?.badge ?? 'bg-zinc-100 text-zinc-600';
  }

  openDetail(id: number): void { this.detailId.set(id); }
  closeDetail(): void          { this.detailId.set(null); }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ billing: 'Daily', status: 'pending' });
    this.showModal.set(true);
  }

  openEdit(r: AdminReservation): void {
    this.editingId.set(r.id);
    this.form.patchValue(r);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveForm(): void {
    if (this.form.invalid) return;
    const v = this.form.value;
    const id = this.editingId();

    if (id !== null) {
      this.reservations.update(list => list.map(r => r.id === id ? { ...r, ...v } : r));
      this.toast.showSuccess('Reservation updated.');
    } else {
      const newId = Math.max(0, ...this.reservations().map(r => r.id)) + 1;
      this.reservations.update(list => [...list, { id: newId, ...v }]);
      this.toast.showSuccess('Reservation created.');
    }
    this.closeModal();
  }

  updateStatus(id: number, status: 'confirmed' | 'pending' | 'cancelled'): void {
    this.reservations.update(list => list.map(r => r.id === id ? { ...r, status } : r));
    this.toast.showSuccess(`Reservation marked as ${status}.`);
  }

  askDelete(id: number): void {
    this.pendingDeleteId.set(id);
  }

  confirmDelete(): void {
    const id = this.pendingDeleteId();
    if (id === null) return;
    this.reservations.update(list => list.filter(r => r.id !== id));
    this.pendingDeleteId.set(null);
    this.toast.showSuccess('Reservation deleted.');
  }

  cancelDelete(): void {
    this.pendingDeleteId.set(null);
  }
}
