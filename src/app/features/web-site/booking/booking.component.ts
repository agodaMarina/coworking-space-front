import { CommonModule, NgClass } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ReservationsService } from '../../../core/services/reservations.service';
import { SpacesService } from '../../../core/services/spaces.service';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { DatePickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { ToastService } from '../../../core/services/toast.service';

type BookingStep = 'details' | 'success';

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
            RouterLink, HeaderComponent, FooterComponent, DatePickerComponent, ToastModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css'],
  providers: [MessageService],
})
export class BookingPageComponent implements OnInit {
  bookingForm!: FormGroup;

  currentStep        = signal<BookingStep>('details');
  isSubmitting       = signal(false);
  spaceDropdownOpen  = signal(false);
  isSpacePreSelected = signal(false);
  recurrenceDropdownOpen = signal(false);

  availableSpaces = signal<BookingSpace[]>([]);

  recurrenceOptions = [
    { label: 'Quotidien',             value: 'daily'    },
    { label: 'Hebdomadaire',          value: 'weekly'   },
    { label: 'Toutes les 2 semaines', value: 'biweekly' },
    { label: 'Mensuel',               value: 'monthly'  },
  ];

  constructor(
    private fb:                  FormBuilder,
    public  spacesService:       SpacesService,
    public  reservationsService: ReservationsService,
    private route:               ActivatedRoute,
    private toastService:        ToastService,
  ) {}

  ngOnInit(): void {
    this.spacesService.disableMocks();
    this.reservationsService.disableMocks();
    this.initializeForm();
    this.loadSpaces();

    this.route.queryParams.subscribe(params => {
      const spaceId = params['spaceId'];
      if (spaceId) {
        this.isSpacePreSelected.set(true);
        this.bookingForm.patchValue({ spaceId: Number(spaceId) });
      }
    });
  }

  // ─── Formulaire ────────────────────────────────────────────────────────────

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

  isFieldInvalid(field: string): boolean {
    const f = this.bookingForm.get(field);
    return !!(f && f.invalid && f.touched);
  }

  // ─── Soumission — crée la réservation sans paiement ────────────────────────

  submitBooking(): void {
    if (this.bookingForm.invalid) { this.bookingForm.markAllAsTouched(); return; }

    this.isSubmitting.set(true);

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
      next: () => {
        this.isSubmitting.set(false);
        this.currentStep.set('success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: err => {
        this.isSubmitting.set(false);
        this.toastService.showError(this.extractErrorMessage(err));
      },
    });
  }

  resetFlow(): void {
    this.bookingForm.reset({ billingType: 'daily', startTime: '09:00', endTime: '17:00', isRecurring: false, recurrencePattern: 'weekly' });
    this.currentStep.set('details');
  }

  private extractErrorMessage(err: any): string {
    if (err?.error?.non_field_errors?.length) return err.error.non_field_errors[0];
    if (err?.error?.error)                    return err.error.error;
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
