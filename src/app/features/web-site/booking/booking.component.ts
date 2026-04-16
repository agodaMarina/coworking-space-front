import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { DatePicker } from 'primeng/datepicker';
import { RadioButton } from 'primeng/radiobutton';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { ReservationsService } from '../../../core/services/reservations.service';
import { Space, SpacesService } from '../../../core/services/spaces.service';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';

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
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderComponent,
    FooterComponent,
    Button,
    DatePicker,
    RadioButton,
    Checkbox,
    Textarea,
    Select,
  ],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css'],
})
export class BookingPageComponent implements OnInit {
  bookingForm!: FormGroup;
  bookingSuccess = false;
  minDate = this.getTodayString();
  minDateObj = new Date();

  availableSpaces = signal<BookingSpace[]>([]);

  recurrenceOptions = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Every 2 Weeks', value: 'biweekly' },
    { label: 'Monthly', value: 'monthly' },
  ];

  constructor(
    private fb: FormBuilder,
    public spacesService: SpacesService,
    public reservationsService: ReservationsService
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.loadSpaces();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.bookingForm.get(fieldName);
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

  getStartDateObj(): Date {
    const start = this.bookingForm.get('startDate')?.value;
    return start ? new Date(start) : new Date();
  }

  getEndDateObj(): Date {
    const end = this.bookingForm.get('endDate')?.value;
    return end ? new Date(end) : new Date();
  }

  getDurationDays(): number {
    const start = this.bookingForm.get('startDate')?.value;
    const end = this.bookingForm.get('endDate')?.value;

    if (!start || !end) return 0;

    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return diffDays;
  }

  getSelectedSpace(): BookingSpace | null {
    const spaceId = this.bookingForm.get('spaceId')?.value;
    if (!spaceId) return null;
    return this.availableSpaces().find(s => s.id === Number(spaceId)) || null;
  }

  calculateTotal(): number {
    const space = this.getSelectedSpace();
    if (!space) return 0;

    const days = this.getDurationDays();
    return space.price_per_day * days;
  }

  submitBooking() {
    if (this.bookingForm.invalid) {
      console.log('Form is invalid', this.bookingForm.errors);
      return;
    }

    const formData = this.bookingForm.value;
    const startDateTime = new Date(formData.startDate);
    const endDateTime = new Date(formData.endDate);

    if (formData.startTime) {
      const [hours, minutes] = formData.startTime.split(':');
      startDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    }
    if (formData.endTime) {
      const [hours, minutes] = formData.endTime.split(':');
      endDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    }

    const reservationData = {
      space_id: Number(formData.spaceId),
      start_datetime: startDateTime.toISOString(),
      end_datetime: endDateTime.toISOString(),
      billing_type: formData.billingType,
      is_recurring: formData.isRecurring,
      recurrence_rule: formData.isRecurring ? formData.recurrencePattern : 'none',
      notes: formData.specialRequests
    };

    this.reservationsService.createReservation(reservationData).subscribe({
      next: (reservation) => {
        console.log('Booking created:', reservation);
        this.bookingSuccess = true;
        setTimeout(() => {
          this.resetForm();
        }, 3000);
      },
      error: (error) => {
        console.error('Error creating booking:', error);
      }
    });
  }

  resetForm() {
    this.bookingForm.reset({
      billingType: 'daily',
      startTime: '09:00',
      endTime: '17:00',
      isRecurring: false,
      recurrencePattern: 'weekly'
    });
    this.bookingSuccess = false;
  }

  initializeForm() {
    this.bookingForm = this.fb.group({
      spaceId: ['', Validators.required],
      startDate: [new Date(), Validators.required],
      endDate: [new Date(), Validators.required],
      billingType: ['daily', Validators.required],
      startTime: ['09:00'],
      endTime: ['17:00'],
      isRecurring: [false],
      recurrencePattern: ['weekly'],
      recurrenceEnd: [''],
      specialRequests: [''],
    });
  }

  loadSpaces() {
    this.spacesService.getAvailableSpaces().subscribe({
      next: (spaces) => {
        const bookingSpaces: BookingSpace[] = spaces.map(space => ({
          id: space.id,
          name: space.name,
          space_type: space.space_type,
          price_per_day: space.price_per_day,
          capacity: space.capacity
            ,
            photo: (space.photos && space.photos.length) ? space.photos[0] : undefined,
            address: space.address
          }));
        this.availableSpaces.set(bookingSpaces);
      },
      error: (error) => console.error('Error loading spaces:', error)
    });
  }

  private getTodayString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
