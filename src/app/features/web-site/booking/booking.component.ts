import { CommonModule, NgClass } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReservationsService } from '../../../core/services/reservations.service';
import { SpacesService } from '../../../core/services/spaces.service';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { DatePickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { MessageService } from 'primeng/api';


type BookingStep = 'details' | 'payment' | 'success';

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
  imports: [CommonModule, NgClass, FormsModule, ReactiveFormsModule, HeaderComponent, FooterComponent, DatePickerComponent],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css'],
  providers:[MessageService]
})
export class BookingPageComponent implements OnInit {
  bookingForm!: FormGroup;
  paymentForm!: FormGroup;

  currentStep = signal<BookingStep>('details');
  isProcessingPayment = signal(false);

  spaceDropdownOpen = signal(false);
  recurrenceDropdownOpen = signal(false);

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
    public reservationsService: ReservationsService
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.initializePaymentForm();
    this.loadSpaces();
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

    this.reservationsService.createReservation({
      space_id:        Number(fv.spaceId),
      start_datetime:  start.toISOString(),
      end_datetime:    end.toISOString(),
      billing_type:    fv.billingType,
      is_recurring:    fv.isRecurring,
      recurrence_rule: fv.isRecurring ? fv.recurrencePattern : 'none',
      notes:           fv.specialRequests,
    }).subscribe({
      next: () => {
        this.isProcessingPayment.set(false);
        this.currentStep.set('success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: () => this.isProcessingPayment.set(false),
    });
  }

  resetFlow() {
    this.bookingForm.reset({ billingType: 'daily', startTime: '09:00', endTime: '17:00', isRecurring: false, recurrencePattern: 'weekly' });
    this.paymentForm.reset();
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
      cardName:   ['', Validators.required],
      cardNumber: ['', [Validators.required, Validators.minLength(19)]],
      expiry:     ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]],
      cvv:        ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
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
