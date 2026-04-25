import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';
import { ReservationsService } from '../../../core/services/reservations.service';
import { PaymentsService } from '../../../core/services/admin/payments.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { TableComponent } from '../../../shared/components/table/table.component';
import { ColumnComponent } from '../../../shared/components/table/column.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../core/services/toast.service';
import { Reservation } from '../../../core/dtos/reservation';
import { environment } from '../../../environments/environment';

type Filter = 'all' | 'upcoming' | 'past' | 'cancelled';
type PayMethod = 'card' | 'mobile_money' | 'cash' | 'bank_transfer';

const PAGE_SIZE = 6;

@Component({
  standalone: true,
  selector: 'app-bookings',
  imports: [NgClass, DatePipe, CurrencyPipe, RouterLink, ReactiveFormsModule,
            PaginationComponent, ConfirmDialogComponent, TableComponent, ColumnComponent],
  templateUrl: './bookings.component.html',
  providers: [MessageService]
})
export class BookingsComponent implements OnInit, OnDestroy {
  private readonly reservationsService = inject(ReservationsService);
  private readonly paymentsService     = inject(PaymentsService);
  private readonly toast               = inject(ToastService);
  private readonly fb                  = inject(FormBuilder);

  readonly reservations    = signal<Reservation[]>([]);
  readonly activeFilter    = signal<Filter>('all');
  readonly isLoading       = this.reservationsService.isLoading;
  readonly cancellingId    = signal<number | null>(null);
  readonly selectedId      = signal<number | null>(null);
  readonly pendingCancel   = signal<number | null>(null);
  readonly page            = signal(1);
  readonly pageSize        = PAGE_SIZE;

  // Payment modal
  readonly showPaymentModal    = signal(false);
  readonly payingReservation   = signal<Reservation | null>(null);
  readonly selectedMethod      = signal<PayMethod>('card');
  readonly isProcessingPayment = signal(false);
  readonly stripeError         = signal<string | null>(null);
  readonly paymentSuccess      = signal(false);

  readonly paymentMethods: { value: PayMethod; label: string; icon: string; desc: string }[] = [
    { value: 'card',          label: 'Carte bancaire', icon: 'lucide:credit-card', desc: 'Visa, Mastercard'    },
    { value: 'mobile_money',  label: 'Mobile Money',  icon: 'lucide:smartphone',  desc: 'Wave, Orange Money'  },
    { value: 'cash',          label: 'Espèces',        icon: 'lucide:banknote',    desc: 'Au guichet'          },
    { value: 'bank_transfer', label: 'Virement',       icon: 'lucide:landmark',    desc: 'IBAN / SWIFT'        },
  ];

  mobileForm!: FormGroup;

  private stripe: Stripe | null = null;
  private cardElement: StripeCardElement | null = null;

  readonly filters: { key: Filter; label: string }[] = [
    { key: 'all',       label: 'Tout'      },
    { key: 'upcoming',  label: 'À venir'   },
    { key: 'past',      label: 'Passées'   },
    { key: 'cancelled', label: 'Annulées'  },
  ];

  readonly allFiltered = computed(() => {
    const now = new Date();
    const all = this.reservations();
    switch (this.activeFilter()) {
      case 'upcoming':  return all.filter(r => r.status !== 'cancelled' && new Date(r.start_datetime) > now);
      case 'past':      return all.filter(r => r.status !== 'cancelled' && new Date(r.end_datetime)   <= now);
      case 'cancelled': return all.filter(r => r.status === 'cancelled');
      default:          return all;
    }
  });

  readonly paginated = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.allFiltered().slice(start, start + PAGE_SIZE);
  });

  readonly selected = computed(() =>
    this.reservations().find(r => r.id === this.selectedId()) ?? null
  );

  ngOnInit(): void {
    this.reservationsService.disableMocks();
    this.reservationsService.getReservations().subscribe({
      next: res => this.reservations.set(res),
    });
    this.mobileForm = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{8,15}$/)]]
    });
    loadStripe(environment.stripePublishableKey).then(s => { this.stripe = s; });
  }

  ngOnDestroy(): void {
    this.cardElement?.destroy();
  }

  // ── Filters & pagination ──────────────────────────────────────────────────

  setFilter(f: Filter): void {
    this.activeFilter.set(f);
    this.page.set(1);
  }

  // ── Detail drawer ─────────────────────────────────────────────────────────

  openDetail(id: number): void  { this.selectedId.set(id); }
  closeDetail(): void           { this.selectedId.set(null); }

  // ── Cancel ────────────────────────────────────────────────────────────────

  askCancel(id: number): void   { this.pendingCancel.set(id); }
  cancelCancel(): void          { this.pendingCancel.set(null); }

  confirmCancel(): void {
    const id = this.pendingCancel();
    if (id === null) return;
    this.pendingCancel.set(null);
    this.cancellingId.set(id);
    this.reservationsService.cancelReservation(id).subscribe({
      next: () => {
        this.reservations.update(list =>
          list.map(r => r.id === id ? { ...r, status: 'cancelled' as const, status_display: 'Annulée' } : r)
        );
        this.cancellingId.set(null);
        this.closeDetail();
        this.toast.showSuccess('Réservation annulée.');
      },
      error: () => this.cancellingId.set(null),
    });
  }

  canCancel(r: Reservation): boolean {
    return r.status !== 'cancelled' && new Date(r.start_datetime) > new Date();
  }

  // ── Status helpers ────────────────────────────────────────────────────────

  statusClass(status: string): string {
    const map: Record<string, string> = {
      pending:         'bg-yellow-100 text-yellow-800',
      confirmed:       'bg-blue-100 text-blue-800',
      payment_pending: 'bg-orange-100 text-orange-800',
      paid:            'bg-green-100 text-green-800',
      rejected:        'bg-red-100 text-red-800',
      cancelled:       'bg-zinc-100 text-zinc-400',
      completed:       'bg-purple-100 text-purple-800',
    };
    return map[status] ?? 'bg-zinc-100 text-zinc-500';
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      pending:         'En attente de confirmation',
      confirmed:       'Confirmée — paiement possible',
      payment_pending: 'Paiement en cours',
      paid:            'Payée',
      rejected:        'Rejetée',
      cancelled:       'Annulée',
      completed:       'Terminée',
    };
    return map[status] ?? status;
  }

  // ── Payment modal ─────────────────────────────────────────────────────────

  openPaymentModal(reservation: Reservation): void {
    this.payingReservation.set(reservation);
    this.selectedMethod.set('card');
    this.stripeError.set(null);
    this.paymentSuccess.set(false);
    this.mobileForm.reset();
    this.showPaymentModal.set(true);
    setTimeout(() => this.mountCardElement(), 150);
  }

  closePaymentModal(): void {
    if (this.isProcessingPayment()) return;
    this.cardElement?.unmount();
    this.cardElement = null;
    this.showPaymentModal.set(false);
    this.payingReservation.set(null);
    this.stripeError.set(null);
    this.paymentSuccess.set(false);
  }

  selectMethod(method: PayMethod): void {
    this.selectedMethod.set(method);
    this.stripeError.set(null);
    if (method === 'card') {
      setTimeout(() => this.mountCardElement(), 100);
    } else {
      this.cardElement?.unmount();
      this.cardElement = null;
    }
  }

  private mountCardElement(): void {
    if (!this.stripe) return;
    const container = document.getElementById('stripe-card-element-dashboard');
    if (!container) return;

    this.cardElement?.unmount();
    this.cardElement = null;

    const elements = this.stripe.elements();
    this.cardElement = elements.create('card', {
      style: {
        base: {
          fontSize: '14px',
          color: '#18181b',
          fontFamily: 'system-ui, sans-serif',
          '::placeholder': { color: '#a1a1aa' }
        },
        invalid: { color: '#ef4444' }
      }
    });
    this.cardElement.mount(container);
    this.cardElement.on('change', evt => {
      this.stripeError.set(evt.error?.message ?? null);
    });
  }

  async submitPayment(): Promise<void> {
    const reservation = this.payingReservation();
    if (!reservation || this.isProcessingPayment()) return;

    const method = this.selectedMethod();
    if (method === 'mobile_money' && this.mobileForm.invalid) {
      this.mobileForm.markAllAsTouched();
      return;
    }

    this.isProcessingPayment.set(true);
    this.stripeError.set(null);

    // 1 — initiate-payment if not already payment_pending
    if (reservation.status !== 'payment_pending') {
      try {
        await new Promise<void>((resolve, reject) => {
          this.reservationsService.initiatePayment(reservation.id).subscribe({
            next: () => {
              this.reservations.update(list =>
                list.map(r => r.id === reservation.id ? { ...r, status: 'payment_pending' as const } : r)
              );
              resolve();
            },
            error: reject
          });
        });
      } catch {
        this.isProcessingPayment.set(false);
        this.toast.showError('Impossible d\'initier le paiement. Réessayez.');
        return;
      }
    }

    // 2 — create payment record
    this.paymentsService.createPayment({ reservation_id: reservation.id, method }).subscribe({
      next: async payment => {
        if (method === 'card') {
          await this.handleStripePayment(payment);
        } else {
          this.isProcessingPayment.set(false);
          this.closePaymentModal();
          const msg = method === 'cash'
            ? 'Paiement en espèces enregistré. Présentez-vous au guichet.'
            : 'Virement enregistré. Votre réservation sera confirmée à réception.';
          this.toast.showSuccess(msg);
          this.reservationsService.getReservations().subscribe(res => this.reservations.set(res));
        }
      },
      error: err => {
        this.isProcessingPayment.set(false);
        const msg = err?.error?.error ?? 'Impossible de créer le paiement.';
        this.toast.showError(msg);
      }
    });
  }

  private async handleStripePayment(payment: any): Promise<void> {
    if (!this.stripe || !this.cardElement) {
      this.isProcessingPayment.set(false);
      this.toast.showError('Stripe non initialisé. Rechargez la page.');
      return;
    }

    const clientSecret: string = payment.client_secret;
    if (!clientSecret) {
      this.isProcessingPayment.set(false);
      this.toast.showError('Client secret Stripe manquant. Contactez le support.');
      return;
    }

    const { error, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: this.cardElement }
    });

    if (error) {
      this.stripeError.set(error.message ?? 'Erreur Stripe.');
      this.isProcessingPayment.set(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      this.paymentsService.stripeConfirmPayment(payment.id).subscribe({
        next: () => {
          this.isProcessingPayment.set(false);
          this.paymentSuccess.set(true);
          const rid = this.payingReservation()?.id;
          this.reservations.update(list =>
            list.map(r => r.id === rid
              ? { ...r, status: 'paid' as const, status_display: 'Payée', can_pay: false }
              : r)
          );
          setTimeout(() => {
            this.closePaymentModal();
            this.toast.showSuccess('Paiement effectué avec succès !');
          }, 1500);
        },
        error: () => {
          this.isProcessingPayment.set(false);
          this.toast.showError('Stripe OK mais confirmation backend échouée. Contactez le support.');
        }
      });
    }
  }
}
