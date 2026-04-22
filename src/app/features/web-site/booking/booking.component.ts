import { CommonModule, NgClass } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReservationsService } from '../../../core/services/reservations.service';
import { SpacesService } from '../../../core/services/spaces.service';
import { PaymentsService } from '../../../core/services/admin/payments.service';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { ActivatedRoute } from '@angular/router';
import { DatePickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ToastService } from '../../../core/services/toast.service';


type BookingStep = 'details' | 'payment' | 'success';
type PaymentMethod = 'card' | 'mobile_money' | 'cash' | 'bank_transfer';

interface BookingSpace {
  id: number;
  name: string;
  space_type: string;
  price_per_day: number;
  capacity: number;
  photo?: string;
  address?: string;
}

@Component({
  standalone: true,
  selector: 'app-booking-page',
  imports: [CommonModule, NgClass, FormsModule, ReactiveFormsModule, HeaderComponent, FooterComponent, DatePickerComponent, ToastModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css'],
  providers:[MessageService]
})
export class BookingPageComponent implements OnInit {
  bookingForm!: FormGroup;
  paymentForm!: FormGroup;

  currentStep = signal<BookingStep>('details');
  isProcessingPayment = signal(false);
  selectedPaymentMethod = signal<PaymentMethod>('mobile_money');

  spaceDropdownOpen = signal(false);
  isSpacePreSelected = signal(false);
  recurrenceDropdownOpen = signal(false);

  readonly paymentMethods = [
    { value: 'mobile_money' as PaymentMethod,   label: 'Mobile Money',   icon: 'lucide:smartphone',  desc: 'Orange · Wave · Free', activeBg: 'bg-pastel-green',  activeText: 'text-zinc-900', subText: 'text-zinc-600' },
    { value: 'cash' as PaymentMethod,           label: 'Espèces',        icon: 'lucide:banknote',    desc: 'Paiement sur place',   activeBg: 'bg-pastel-orange', activeText: 'text-zinc-900', subText: 'text-zinc-600' },
    { value: 'bank_transfer' as PaymentMethod,  label: 'Virement',       icon: 'lucide:landmark',    desc: 'Virement bancaire',    activeBg: 'bg-pastel-orange', activeText: 'text-zinc-900', subText: 'text-zinc-600' },
  ];

  readonly countries = [
    { code: 'SN', name: 'Sénégal',        dial: '+221', flag: '🇸🇳' },
    { code: 'CI', name: "Côte d'Ivoire",  dial: '+225', flag: '🇨🇮' },
    { code: 'ML', name: 'Mali',           dial: '+223', flag: '🇲🇱' },
    { code: 'GN', name: 'Guinée',         dial: '+224', flag: '🇬🇳' },
    { code: 'BF', name: 'Burkina Faso',   dial: '+226', flag: '🇧🇫' },
    { code: 'NE', name: 'Niger',          dial: '+227', flag: '🇳🇪' },
    { code: 'TG', name: 'Togo',           dial: '+228', flag: '🇹🇬' },
    { code: 'BJ', name: 'Bénin',          dial: '+229', flag: '🇧🇯' },
    { code: 'CM', name: 'Cameroun',       dial: '+237', flag: '🇨🇲' },
    { code: 'FR', name: 'France',         dial: '+33',  flag: '🇫🇷' },
  ];

  selectedCountry = signal(this.countries[0]);
  countryDropdownOpen = signal(false);

  availableSpaces = signal<BookingSpace[]>([]);

  recurrenceOptions = [
    { label: 'Daily',         value: 'daily'    },
    { label: 'Weekly',        value: 'weekly'   },
    { label: 'Every 2 Weeks', value: 'biweekly' },
    { label: 'Monthly',       value: 'monthly'  },
  ];

  constructor(
    private fb: FormBuilder,
    public spacesService: SpacesService,
    public reservationsService: ReservationsService,
    private paymentsService: PaymentsService,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.spacesService.disableMocks();
    this.reservationsService.disableMocks();
    this.initializeForm();
    this.initializePaymentForm();
    this.updatePaymentValidators('mobile_money');
    this.loadSpaces();
    
    this.route.queryParams.subscribe(params => {
      const spaceId = params['spaceId'];
      if (spaceId) {
        this.isSpacePreSelected.set(true);
        this.bookingForm.patchValue({ spaceId: Number(spaceId) });
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.bookingForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  isPaymentFieldInvalid(fieldName: string): boolean {
    const field = this.paymentForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  onRecurringChange() {
    const isRecurring = this.bookingForm.get('isRecurring')?.value;
    const recurrenceEnd = this.bookingForm.get('recurrenceEnd');
    if (isRecurring) {
      recurrenceEnd?.setValidators([Validators.required]);
    } else {
      recurrenceEnd?.clearValidators();
    }
    recurrenceEnd?.updateValueAndValidity();
  }

  getDurationDays(): number {
    const start = this.bookingForm.get('startDate')?.value;
    const end   = this.bookingForm.get('endDate')?.value;
    if (!start || !end) return 0;
    const diff = Math.abs(new Date(end).getTime() - new Date(start).getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  }

  getSelectedSpace(): BookingSpace | null {
    const id = this.bookingForm.get('spaceId')?.value;
    return id ? (this.availableSpaces().find(s => s.id === Number(id)) ?? null) : null;
  }

  calculateTotal(): number {
    const space = this.getSelectedSpace();
    return space ? space.price_per_day * this.getDurationDays() : 0;
  }

  selectSpace(space: BookingSpace): void {
    this.bookingForm.get('spaceId')?.setValue(space.id);
    this.spaceDropdownOpen.set(false);
  }

  selectPaymentMethod(method: PaymentMethod): void {
    this.selectedPaymentMethod.set(method);
    this.paymentForm.reset();
    this.updatePaymentValidators(method);
  }

  private updatePaymentValidators(method: PaymentMethod): void {
    const cardFields = ['cardName', 'cardNumber', 'expiry', 'cvv'];
    cardFields.forEach(f => {
      this.paymentForm.get(f)?.clearValidators();
      this.paymentForm.get(f)?.updateValueAndValidity();
    });
    this.paymentForm.get('phoneNumber')?.clearValidators();
    this.paymentForm.get('phoneNumber')?.updateValueAndValidity();
    this.paymentForm.get('paypalEmail')?.clearValidators();
    this.paymentForm.get('paypalEmail')?.updateValueAndValidity();

    if (method === 'card') {
      this.paymentForm.get('cardName')?.setValidators(Validators.required);
      this.paymentForm.get('cardNumber')?.setValidators([Validators.required, Validators.minLength(19)]);
      this.paymentForm.get('expiry')?.setValidators([Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]);
      this.paymentForm.get('cvv')?.setValidators([Validators.required, Validators.pattern(/^\d{3,4}$/)]);
    } else if (method === 'mobile_money') {
      this.paymentForm.get('phoneNumber')?.setValidators([Validators.required, Validators.pattern(/^\+?[\d\s]{8,15}$/)]);
    }
    // cash and bank_transfer require no extra fields

    cardFields.forEach(f => this.paymentForm.get(f)?.updateValueAndValidity());
    this.paymentForm.get('phoneNumber')?.updateValueAndValidity();
    this.paymentForm.get('paypalEmail')?.updateValueAndValidity();
  }

  selectRecurrence(value: string): void {
    this.bookingForm.get('recurrencePattern')?.setValue(value);
    this.recurrenceDropdownOpen.set(false);
  }

  getRecurrenceLabel(): string {
    const val = this.bookingForm.get('recurrencePattern')?.value;
    return this.recurrenceOptions.find(o => o.value === val)?.label ?? 'Select pattern…';
  }

  proceedToPayment() {
    if (this.bookingForm.invalid) { this.bookingForm.markAllAsTouched(); return; }
    this.currentStep.set('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  backToDetails() { this.currentStep.set('details'); }

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

  submitPayment() {
    if (this.paymentForm.invalid) { this.paymentForm.markAllAsTouched(); return; }
    this.isProcessingPayment.set(true);

    const fv = this.bookingForm.value;
    const start = new Date(fv.startDate);
    const end   = new Date(fv.endDate);
    if (fv.startTime) { const [h,m] = fv.startTime.split(':'); start.setHours(+h,+m); }
    if (fv.endTime)   { const [h,m] = fv.endTime.split(':');   end.setHours(+h,+m);   }

    const method = this.selectedPaymentMethod();

    this.reservationsService.createReservation({
      space_id:        Number(fv.spaceId),
      start_datetime:  start.toISOString(),
      end_datetime:    end.toISOString(),
      billing_type:    fv.billingType,
      is_recurring:    fv.isRecurring,
      recurrence_rule: fv.isRecurring ? fv.recurrencePattern : 'none',
      notes:           fv.specialRequests,
    }).subscribe({
      next: (reservation) => {
        // Chain payment creation after reservation
        this.paymentsService.disableMocks();
        this.paymentsService.createPayment({
          reservation_id: reservation.id,
          method: method,
        }).subscribe({
          next: () => {
            this.isProcessingPayment.set(false);
            this.currentStep.set('success');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          },
          error: (err) => {
            this.isProcessingPayment.set(false);
            const errMsg = this.extractErrorMessage(err);
            this.toastService.showError(errMsg);
          },
        });
      },
      error: (err) => {
        this.isProcessingPayment.set(false);
        const errMsg = this.extractErrorMessage(err);
        this.toastService.showError(errMsg);
      },
    });
  }

  private extractErrorMessage(err: any): string {
    if (err?.error?.non_field_errors?.length) {
      return err.error.non_field_errors[0];
    }
    if (err?.error?.error) {
      return err.error.error;
    }
    if (err?.error?.reservation_id?.length) {
      return err.error.reservation_id[0];
    }
    // General fallback
    if (typeof err?.error === 'object') {
       const firstKey = Object.keys(err.error)[0];
       if (firstKey && Array.isArray(err.error[firstKey])) {
          return err.error[firstKey][0];
       }
    }
    return err?.message || 'Une erreur est survenue lors de la réservation.';
  }

  resetFlow() {
    this.bookingForm.reset({ billingType: 'daily', startTime: '09:00', endTime: '17:00', isRecurring: false, recurrencePattern: 'weekly' });
    this.paymentForm.reset();
    this.selectedPaymentMethod.set('mobile_money');
    this.updatePaymentValidators('mobile_money');
    this.currentStep.set('details');
  }

  initializeForm() {
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

  initializePaymentForm() {
    this.paymentForm = this.fb.group({
      cardName:    ['', Validators.required],
      cardNumber:  ['', [Validators.required, Validators.minLength(19)]],
      expiry:      ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]],
      cvv:         ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      phoneNumber: [''],
      paypalEmail: [''],
    });
  }

  loadSpaces() {
    this.spacesService.getAvailableSpaces().subscribe({
      next: spaces => this.availableSpaces.set(spaces.map(s => ({
        id:            s.id,
        name:          s.name,
        space_type:    s.space_type,
        price_per_day: s.price_per_day,
        capacity:      s.capacity,
        photo:         s.photos?.length ? s.photos[0] : undefined,
        address:       s.address,
      }))),
    });
  }

  today(): string {
    return new Date().toISOString().split('T')[0];
  }
}
