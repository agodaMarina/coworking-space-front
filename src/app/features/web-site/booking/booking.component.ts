import { CommonModule, NgClass } from '@angular/common';
import { Component, OnInit, effect, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Stripe, StripeCardElement, loadStripe } from '@stripe/stripe-js';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { environment } from '../../../environments/environment';
import { PaymentsService } from '../../../core/services/admin/payments.service';
import { ReservationsService } from '../../../core/services/reservations.service';
import { SpacesService } from '../../../core/services/spaces.service';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { DatePickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { ToastService } from '../../../core/services/toast.service';

type BookingStep    = 'details' | 'payment' | 'success';
type PaymentMethod  = 'card' | 'mobile_money' | 'cash' | 'bank_transfer';

interface BookingSpace {
  id:            number;
  name:          string;
  space_type:    string;
  price_per_day: number;
  capacity:      number;
  photo?:        string;
  photos?:       any[];
  address?:      string;
}

@Component({
  standalone: true,
  selector: 'app-booking-page',
  imports: [CommonModule, NgClass, FormsModule, ReactiveFormsModule,
            HeaderComponent, FooterComponent, DatePickerComponent, ToastModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css'],
  providers: [MessageService],
})
export class BookingPageComponent implements OnInit {
  bookingForm!: FormGroup;
  paymentForm!: FormGroup;

  currentStep             = signal<BookingStep>('details');
  isProcessingPayment     = signal(false);
  selectedPaymentMethod   = signal<PaymentMethod>('mobile_money');
  spaceDropdownOpen       = signal(false);
  isSpacePreSelected      = signal(false);
  recurrenceDropdownOpen  = signal(false);
  countryDropdownOpen     = signal(false);
  stripeError             = signal<string | null>(null);
  stripeReady             = signal(false);

  private stripe:      Stripe | null          = null;
  private cardElement: StripeCardElement | null = null;

  readonly paymentMethods = [
    { value: 'card'          as PaymentMethod, label: 'Carte bancaire', icon: 'lucide:credit-card', desc: 'Visa · Mastercard',    activeBg: 'bg-[#AEE9F4]'    },
    { value: 'mobile_money'  as PaymentMethod, label: 'Mobile Money',   icon: 'lucide:smartphone',  desc: 'Orange · Wave · Free', activeBg: 'bg-pastel-green'  },
    { value: 'cash'          as PaymentMethod, label: 'Espèces',        icon: 'lucide:banknote',    desc: 'Paiement sur place',   activeBg: 'bg-pastel-orange' },
    { value: 'bank_transfer' as PaymentMethod, label: 'Virement',       icon: 'lucide:landmark',    desc: 'Virement bancaire',    activeBg: 'bg-pastel-orange' },
  ];

  readonly countries = [
    { code: 'SN', name: 'Sénégal',       dial: '+221', flag: '🇸🇳' },
    { code: 'CI', name: "Côte d'Ivoire", dial: '+225', flag: '🇨🇮' },
    { code: 'ML', name: 'Mali',          dial: '+223', flag: '🇲🇱' },
    { code: 'GN', name: 'Guinée',        dial: '+224', flag: '🇬🇳' },
    { code: 'BF', name: 'Burkina Faso',  dial: '+226', flag: '🇧🇫' },
    { code: 'NE', name: 'Niger',         dial: '+227', flag: '🇳🇪' },
    { code: 'TG', name: 'Togo',          dial: '+228', flag: '🇹🇬' },
    { code: 'BJ', name: 'Bénin',         dial: '+229', flag: '🇧🇯' },
    { code: 'CM', name: 'Cameroun',      dial: '+237', flag: '🇨🇲' },
    { code: 'FR', name: 'France',        dial: '+33',  flag: '🇫🇷' },
  ];

  selectedCountry = signal(this.countries[0]);
  availableSpaces = signal<BookingSpace[]>([]);

  recurrenceOptions = [
    { label: 'Quotidien',       value: 'daily'    },
    { label: 'Hebdomadaire',    value: 'weekly'   },
    { label: 'Toutes les 2 semaines', value: 'biweekly' },
    { label: 'Mensuel',         value: 'monthly'  },
  ];

  constructor(
    private fb:                  FormBuilder,
    public  spacesService:       SpacesService,
    public  reservationsService: ReservationsService,
    private paymentsService:     PaymentsService,
    private route:               ActivatedRoute,
    private toastService:        ToastService,
  ) {
    // Monte le Card Element dès que l'étape paiement + méthode carte est active
    effect(() => {
      const step   = this.currentStep();
      const method = this.selectedPaymentMethod();
      if (step === 'payment' && method === 'card') {
        setTimeout(() => this.mountStripeCard(), 80);
      } else {
        this.destroyStripeCard();
      }
    });
  }

  ngOnInit(): void {
    this.spacesService.disableMocks();
    this.reservationsService.disableMocks();
    this.initializeForm();
    this.initializePaymentForm();
    this.updatePaymentValidators('mobile_money');
    this.loadSpaces();
    this.initStripe();

    this.route.queryParams.subscribe(params => {
      const spaceId = params['spaceId'];
      if (spaceId) {
        this.isSpacePreSelected.set(true);
        this.bookingForm.patchValue({ spaceId: Number(spaceId) });
      }
    });
  }

  // ─── Stripe ────────────────────────────────────────────────────────────────

  private async initStripe(): Promise<void> {
    this.stripe = await loadStripe(environment.stripePublishableKey);
  }

  private mountStripeCard(): void {
    if (!this.stripe || this.cardElement) return;
    const el = document.getElementById('stripe-card-element');
    if (!el) return;

    const elements = this.stripe.elements();
    this.cardElement = elements.create('card', {
      hidePostalCode: true,
      style: {
        base: {
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize:   '14px',
          color:      '#09090b',
          '::placeholder': { color: '#d4d4d8' },
        },
        invalid: { color: '#ef4444' },
      },
    });
    this.cardElement.mount(el);
    this.cardElement.on('change', event => {
      this.stripeError.set(event.error?.message ?? null);
      this.stripeReady.set(event.complete);
    });
  }

  private destroyStripeCard(): void {
    if (!this.cardElement) return;
    this.cardElement.unmount();
    this.cardElement.destroy();
    this.cardElement = null;
    this.stripeReady.set(false);
    this.stripeError.set(null);
  }

  // ─── Formulaires ───────────────────────────────────────────────────────────

  initializeForm(): void {
    this.bookingForm = this.fb.group({
      spaceId:           ['', Validators.required],
      startDate:         ['', Validators.required],
      endDate:           ['', Validators.required],
      billingType:       ['daily', Validators.required],
      startTime:         ['09:00'],
      endTime:           ['17:00'],
      isRecurring:       [false],
      recurrencePattern: ['weekly'],
      recurrenceEnd:     [''],
      specialRequests:   [''],
    });
  }

  initializePaymentForm(): void {
    this.paymentForm = this.fb.group({
      phoneNumber: [''],
    });
  }

  isFieldInvalid(field: string): boolean {
    const f = this.bookingForm.get(field);
    return !!(f && f.invalid && f.touched);
  }

  isPaymentFieldInvalid(field: string): boolean {
    const f = this.paymentForm.get(field);
    return !!(f && f.invalid && f.touched);
  }

  private updatePaymentValidators(method: PaymentMethod): void {
    this.paymentForm.get('phoneNumber')?.clearValidators();
    if (method === 'mobile_money') {
      this.paymentForm.get('phoneNumber')?.setValidators([Validators.required]);
    }
    this.paymentForm.get('phoneNumber')?.updateValueAndValidity();
  }

  // ─── Navigation ────────────────────────────────────────────────────────────

  proceedToPayment(): void {
    if (this.bookingForm.invalid) { this.bookingForm.markAllAsTouched(); return; }
    this.currentStep.set('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  backToDetails(): void { this.currentStep.set('details'); }

  resetFlow(): void {
    this.bookingForm.reset({ billingType: 'daily', startTime: '09:00', endTime: '17:00', isRecurring: false, recurrencePattern: 'weekly' });
    this.paymentForm.reset();
    this.selectedPaymentMethod.set('mobile_money');
    this.updatePaymentValidators('mobile_money');
    this.currentStep.set('details');
  }

  // ─── Méthodes de paiement ──────────────────────────────────────────────────

  selectPaymentMethod(method: PaymentMethod): void {
    this.selectedPaymentMethod.set(method);
    this.paymentForm.reset();
    this.updatePaymentValidators(method);
  }

  // ─── Soumission ────────────────────────────────────────────────────────────

  submitPayment(): void {
    if (this.paymentForm.invalid) { this.paymentForm.markAllAsTouched(); return; }

    const method = this.selectedPaymentMethod();
    if (method === 'card' && !this.stripeReady()) {
      this.stripeError.set('Veuillez saisir vos informations de carte.');
      return;
    }

    this.isProcessingPayment.set(true);

    const fv    = this.bookingForm.value;
    const start = new Date(fv.startDate);
    const end   = new Date(fv.endDate);
    if (fv.startTime) { const [h, m] = fv.startTime.split(':'); start.setHours(+h, +m); }
    if (fv.endTime)   { const [h, m] = fv.endTime.split(':');   end.setHours(+h, +m);   }

    this.reservationsService.createReservation({
      space_id:        Number(fv.spaceId),
      start_datetime:  start.toISOString(),
      end_datetime:    end.toISOString(),
      billing_type:    fv.billingType,
      is_recurring:    fv.isRecurring,
      recurrence_rule: fv.isRecurring ? fv.recurrencePattern : 'none',
      notes:           fv.specialRequests,
    }).subscribe({
      next:  reservation => this.createPaymentForReservation(reservation.id, method),
      error: err => { this.isProcessingPayment.set(false); this.toastService.showError(this.extractErrorMessage(err)); },
    });
  }

  private createPaymentForReservation(reservationId: number, method: PaymentMethod): void {
    this.paymentsService.disableMocks();
    this.paymentsService.createPayment({ reservation_id: reservationId, method }).subscribe({
      next: response => {
        if (method === 'card') {
          this.handleStripePayment(response.id, response.client_secret);
        } else {
          this.isProcessingPayment.set(false);
          this.currentStep.set('success');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      },
      error: err => { this.isProcessingPayment.set(false); this.toastService.showError(this.extractErrorMessage(err)); },
    });
  }

  private handleStripePayment(paymentId: number, clientSecret?: string): void {
    if (!clientSecret || !this.stripe || !this.cardElement) {
      this.isProcessingPayment.set(false);
      this.toastService.showError('Erreur Stripe : impossible d\'initialiser le paiement.');
      return;
    }

    this.stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: this.cardElement },
    }).then(({ error, paymentIntent }) => {
      if (error) {
        this.stripeError.set(error.message ?? 'Paiement refusé par votre banque.');
        this.isProcessingPayment.set(false);
        return;
      }
      if (paymentIntent?.status === 'succeeded') {
        // Confirmation serveur — source of truth
        this.paymentsService.stripeConfirmPayment(paymentId).subscribe({
          next:  () => { this.isProcessingPayment.set(false); this.currentStep.set('success'); window.scrollTo({ top: 0, behavior: 'smooth' }); },
          error: err => { this.isProcessingPayment.set(false); this.toastService.showError(this.extractErrorMessage(err)); },
        });
      }
    });
  }

  private extractErrorMessage(err: any): string {
    if (err?.error?.non_field_errors?.length) return err.error.non_field_errors[0];
    if (err?.error?.error)                    return err.error.error;
    if (err?.error?.reservation_id?.length)   return err.error.reservation_id[0];
    if (typeof err?.error === 'object') {
      const firstKey = Object.keys(err.error)[0];
      if (firstKey && Array.isArray(err.error[firstKey])) return err.error[firstKey][0];
    }
    return err?.message || 'Une erreur est survenue lors de la réservation.';
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  selectSpace(space: BookingSpace): void {
    this.bookingForm.get('spaceId')?.setValue(space.id);
    this.spaceDropdownOpen.set(false);
  }

  selectRecurrence(value: string): void {
    this.bookingForm.get('recurrencePattern')?.setValue(value);
    this.recurrenceDropdownOpen.set(false);
  }

  getRecurrenceLabel(): string {
    const val = this.bookingForm.get('recurrencePattern')?.value;
    return this.recurrenceOptions.find(o => o.value === val)?.label ?? 'Choisir une fréquence…';
  }

  onRecurringChange(): void {
    const isRecurring    = this.bookingForm.get('isRecurring')?.value;
    const recurrenceEnd  = this.bookingForm.get('recurrenceEnd');
    isRecurring ? recurrenceEnd?.setValidators([Validators.required]) : recurrenceEnd?.clearValidators();
    recurrenceEnd?.updateValueAndValidity();
  }

  getDurationDays(): number {
    const start = this.bookingForm.get('startDate')?.value;
    const end   = this.bookingForm.get('endDate')?.value;
    if (!start || !end) return 0;
    return Math.ceil(Math.abs(new Date(end).getTime() - new Date(start).getTime()) / 86_400_000) + 1;
  }

  getSelectedSpace(): BookingSpace | null {
    const id = this.bookingForm.get('spaceId')?.value;
    return id ? (this.availableSpaces().find(s => s.id === Number(id)) ?? null) : null;
  }

  calculateTotal(): number {
    const space = this.getSelectedSpace();
    return space ? space.price_per_day * this.getDurationDays() : 0;
  }

  getSpaceImage(space: BookingSpace): string {
    if (space.photo) return space.photo;
    const primary = space.photos?.find((p: any) => p.is_primary);
    if (primary?.url) return primary.url;
    if (space.photos?.length) return space.photos[0].url;
    return 'icons/space-placeholder.svg';
  }

  loadSpaces(): void {
    this.spacesService.getAvailableSpaces().subscribe({
      next: spaces => this.availableSpaces.set(spaces.map(s => ({
        id:            s.id,
        name:          s.name,
        space_type:    s.space_type,
        price_per_day: s.price_per_day,
        capacity:      s.capacity,
        photo:         s.photo,
        photos:        s.photos,
        address:       s.address,
      }))),
    });
  }

  today(): string {
    return new Date().toISOString().split('T')[0];
  }
}
