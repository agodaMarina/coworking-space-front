
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgClass, CurrencyPipe, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { TableComponent } from '../../../shared/components/table/table.component';
import { ColumnComponent } from '../../../shared/components/table/column.component';
import { Reservation } from '../../../core/dtos/reservation';
import { ReservationsService } from '../../../core/services/reservations.service';
import { MessageService } from 'primeng/api';

@Component({
  standalone: true,
  selector: 'app-dashboard-payments',
  imports: [NgClass, CurrencyPipe, DatePipe, ReactiveFormsModule, TableComponent, ColumnComponent],
  templateUrl: './payments.component.html',
  providers:[MessageService]
})
export class DashboardPaymentsComponent implements OnInit {
  private readonly reservationsService = inject(ReservationsService);
  private readonly fb = inject(FormBuilder);

  readonly reservations = signal<Reservation[]>([]);
  readonly isLoading = this.reservationsService.isLoading;
  readonly selectedReservation = signal<Reservation | null>(null);
  readonly isPaying = signal(false);
  readonly paymentSuccess = signal(false);

  readonly paymentForm = this.fb.group({
    cardName:   ['', Validators.required],
    cardNumber: ['', [Validators.required, Validators.pattern(/^\d{4} \d{4} \d{4} \d{4}$/)]],
    expiry:     ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]],
    cvv:        ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
  });

  readonly stats = computed(() => {
    const all = this.reservations();
    const paid    = all.filter(r => r.status === 'confirmed');
    const pending = all.filter(r => r.status === 'pending');
    return {
      totalPaid:  paid.reduce((s, r) => s + r.total_price, 0),
      paid:       paid.length,
      pending:    pending.length,
      totalSpent: all.filter(r => r.status !== 'cancelled').reduce((s, r) => s + r.total_price, 0),
    };
  });

  invoiceNumber(id: number): string {
    return `INV-${String(id).padStart(4, '0')}`;
  }

  paymentStatusFromReservation(status: string): string {
    const map: Record<string, string> = {
      confirmed: 'paid',
      pending:   'pending',
      cancelled: 'cancelled',
    };
    return map[status] ?? status;
  }

  statusBadge(status: string): string {
    const map: Record<string, string> = {
      confirmed: 'bg-[#CEF09D] text-zinc-800',
      pending:   'bg-[#FDD5AB] text-zinc-800',
      cancelled: 'bg-zinc-100 text-zinc-500',
    };
    return map[status] ?? 'bg-zinc-100 text-zinc-600';
  }

  openPayment(reservation: Reservation): void {
    this.selectedReservation.set(reservation);
    this.paymentSuccess.set(false);
    this.paymentForm.reset();
  }

  closePayment(): void {
    this.selectedReservation.set(null);
    this.paymentSuccess.set(false);
  }

  formatCardNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 16);
    input.value = digits.replace(/(.{4})/g, '$1 ').trim();
    this.paymentForm.get('cardNumber')?.setValue(input.value, { emitEvent: false });
  }

  formatExpiry(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 4);
    input.value = digits.length > 2 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits;
    this.paymentForm.get('expiry')?.setValue(input.value, { emitEvent: false });
  }

  submitPayment(): void {
    if (this.paymentForm.invalid) return;
    this.isPaying.set(true);
    setTimeout(() => {
      const id = this.selectedReservation()?.id;
      if (id) {
        this.reservations.update(list =>
          list.map(r => r.id === id ? { ...r, status: 'confirmed', status_display: 'Confirmed' } : r)
        );
      }
      this.isPaying.set(false);
      this.paymentSuccess.set(true);
    }, 1500);
  }

  ngOnInit(): void {
    this.reservationsService.getReservations().subscribe({
      next: r => this.reservations.set(r),
    });
  }
}
