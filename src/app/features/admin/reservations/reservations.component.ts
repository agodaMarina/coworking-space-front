import { Component, computed, signal, OnInit } from '@angular/core';
import { NgClass, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
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
import { ReservationsService } from '../../../core/services/reservations.service';
import { Reservation, CreateReservation } from '../../../core/dtos/reservation';

export interface AdminReservation {
  id: number;
  user: string;
  space: string;
  start: string;
  end: string;
  billing: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'payment_pending' | 'paid' | 'cancelled' | 'completed';
  amount: number;
  notes?: string;
}

@Component({
  standalone: true,
  selector: 'app-admin-reservations',
  imports: [
    NgClass,
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule,
    InputComponent,
    TextareaComponent,
    SelectComponent,
    DatePickerComponent,
    ConfirmDialogComponent,
    PaginationComponent,
    TableComponent,
    ColumnComponent,
  ],
  templateUrl: './reservations.component.html',
  providers: [MessageService],
})
export class AdminReservationsComponent implements OnInit {
  readonly activeFilter = signal<'all' | 'confirmed' | 'pending' | 'rejected' | 'paid' | 'cancelled'>('all');
  readonly page = signal(1);
  readonly pageSize = 8;
  readonly showModal = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly pendingDeleteId = signal<number | null>(null);
  readonly detailId = signal<number | null>(null);

  readonly form: FormGroup;

  readonly filters = [
    { key: 'all' as const,       label: 'Tous'      },
    { key: 'pending' as const,   label: 'En attente' },
    { key: 'confirmed' as const, label: 'Confirmées' },
    { key: 'paid' as const,      label: 'Payées'     },
    { key: 'rejected' as const,  label: 'Rejetées'   },
    { key: 'cancelled' as const, label: 'Annulées'   },
  ];

  readonly userOptions: SelectOption<number>[] = [
    { label: 'Alice Martin', value: 1 },
    { label: 'Bob Johnson', value: 2 },
    { label: 'Carol White', value: 3 },
    { label: 'David Brown', value: 4 },
    { label: 'Eva Green', value: 5 },
    { label: 'Frank Taylor', value: 6 },
    { label: 'Grace Wilson', value: 7 },
  ];

  readonly spaceOptions: SelectOption<number>[] = [
    { label: 'Open Space A', value: 1 },
    { label: 'Meeting Room 1', value: 2 },
    { label: 'Private Office 3', value: 3 },
    { label: 'Hot Desk B', value: 4 },
    { label: 'Conference Hall', value: 5 },
    { label: 'Open Space B', value: 6 },
  ];

  // readonly spaceOptions: SelectOption<string>[] = [
  //   { label: 'Open Space A', value: 'Open Space A' },
  //   { label: 'Meeting Room 1', value: 'Meeting Room 1' },
  //   { label: 'Private Office 3', value: 'Private Office 3' },
  //   { label: 'Hot Desk B', value: 'Hot Desk B' },
  //   { label: 'Conference Hall', value: 'Conference Hall' },
  //   { label: 'Open Space B', value: 'Open Space B' },
  // ];

  readonly billingOptions: SelectOption<string>[] = [
    { label: 'Horaire',    value: 'Hourly' },
    { label: 'Journalier', value: 'Daily' },
    { label: 'Mensuel',    value: 'Monthly' },
  ];

  readonly statusOptions: SelectOption<string>[] = [
    { label: 'En attente',        value: 'pending',         badge: 'bg-yellow-100 text-yellow-800' },
    { label: 'Confirmée',         value: 'confirmed',       badge: 'bg-blue-100 text-blue-800'    },
    { label: 'Rejetée',           value: 'rejected',        badge: 'bg-red-100 text-red-800'      },
    { label: 'Paiement en cours', value: 'payment_pending', badge: 'bg-orange-100 text-orange-800' },
    { label: 'Payée',             value: 'paid',            badge: 'bg-green-100 text-green-800'  },
    { label: 'Annulée',           value: 'cancelled',       badge: 'bg-zinc-100 text-zinc-500'    },
    { label: 'Terminée',          value: 'completed',       badge: 'bg-purple-100 text-purple-800' },
  ];

  readonly reservations = signal<AdminReservation[]>([]);

  readonly filtered = computed(() => {
    const f = this.activeFilter();
    return f === 'all' ? this.reservations() : this.reservations().filter((r) => r.status === f);
  });

  readonly paginated = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  readonly stats = computed(() => ({
    total: this.reservations().length,
    confirmed: this.reservations().filter((r) => r.status === 'confirmed').length,
    pending: this.reservations().filter((r) => r.status === 'pending').length,
    cancelled: this.reservations().filter((r) => r.status === 'cancelled').length,
  }));

  readonly modalTitle = computed(() =>
    this.editingId() !== null ? 'Modifier la réservation' : 'Nouvelle réservation',
  );
  readonly submitLabel = computed(() =>
    this.editingId() !== null ? 'Enregistrer' : 'Créer la réservation',
  );
  readonly detail = computed(
    () => this.reservations().find((r) => r.id === this.detailId()) ?? null,
  );

  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    private reservationsService: ReservationsService,
  ) {
    this.form = this.fb.group({
      user: [null, Validators.required],
      space: [null, Validators.required],
      start: ['', Validators.required],
      end: ['', Validators.required],
      billing: ['Daily', Validators.required],
      status: ['pending', Validators.required],
      amount: [null],
      notes: [''],
    });
  }

  ngOnInit(): void {
    this.reservationsService.disableMocks();
    this.loadReservations();
  }

  private loadReservations(): void {
    this.reservationsService.getReservationsPage().subscribe((page) => {
      this.reservations.set(page.results.map((res) => this.mapToAdminReservation(res)));
    });
  }

  private mapToAdminReservation(res: Reservation): AdminReservation {
    return {
      id: res.id,
      user: res.user_detail?.full_name ?? res.user_detail?.email ?? '—',
      space: res.space_detail?.name ?? '—',
      start: this.formatDate(res.start_datetime),
      end: this.formatDate(res.end_datetime),
      billing: this.capitalize(res.billing_type),
      status: res.status as AdminReservation['status'],
      amount: res.total_price,
      notes: res.notes,
    };
  }

  private formatDate(dateStr: string): string {
    return dateStr.split('T')[0];
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private getUserId(name: string): number {
    return this.userOptions.find((o) => o.label === name)?.value || 1;
  }

  private getSpaceId(name: string): number {
    return this.spaceOptions.find((o) => o.label === name)?.value || 1;
  }

  statusBadge(status: string): string {
    return this.statusOptions.find((o) => o.value === status)?.badge ?? 'bg-zinc-100 text-zinc-600';
  }

  statusLabel(status: string): string {
    return this.statusOptions.find((o) => o.value === status)?.label ?? status;
  }

  openDetail(id: number): void {
    this.detailId.set(id);
  }
  closeDetail(): void {
    this.detailId.set(null);
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ billing: 'Daily', status: 'pending', user: null, space: null });
    this.showModal.set(true);
  }

  openEdit(r: AdminReservation): void {
    this.editingId.set(r.id);
    this.form.patchValue({
      ...r,
      user: this.getUserId(r.user),
      space: this.getSpaceId(r.space),
    });
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
      // Update
      const payload = { status: v.status, notes: v.notes };
      this.reservationsService.updateReservation(id, payload).subscribe(() => {
        this.loadReservations();
        this.toast.showSuccess('Réservation mise à jour.');
        this.closeModal();
      });
    }
    else {
      // Create
      const payload: CreateReservation = {
        space_id: v.space,
        start_datetime: v.start + 'T00:00:00Z',
        end_datetime: v.end + 'T23:59:59Z',
        billing_type: v.billing.toLowerCase() as 'hourly' | 'daily',
        notes: v.notes
      };
      this.reservationsService.createReservation(payload).subscribe(() => {
        this.loadReservations();
        this.toast.showSuccess('Réservation créée.');
        this.closeModal();
      });
    }
     this.closeModal();
  }



  updateStatus(id: number, status: AdminReservation['status']): void {
    this.reservationsService.updateReservation(id, { status }).subscribe({
      next: () => {
        this.loadReservations();
        const labels: Record<string, string> = {
          confirmed: 'Réservation confirmée.',
          rejected:  'Réservation rejetée.',
          cancelled: 'Réservation annulée.',
        };
        this.toast.showSuccess(labels[status] ?? `Statut mis à jour : ${status}.`);
      },
      error: () => this.toast.showError('Impossible de mettre à jour la réservation.'),
    });
  }

  askDelete(id: number): void {
    this.pendingDeleteId.set(id);
  }

  confirmDelete(): void {
    const id = this.pendingDeleteId();
    if (id === null) return;
    this.reservationsService.cancelReservation(id).subscribe(() => {
      this.loadReservations();
      this.pendingDeleteId.set(null);
      this.toast.showSuccess('Réservation annulée.');
    });
  }

  cancelDelete(): void {
    this.pendingDeleteId.set(null);
  }
}
