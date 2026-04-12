import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../shared/components/header/header.component';

interface BookingSpace {
  id: number;
  name: string;
  type: string;
  price: number;
  capacity: number;
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
    ButtonModule,
    CardModule,
  ],
  template: `
    <div class="page-shell">
      <app-header></app-header>
      <main class="content-shell">
        <!-- Hero Section -->
        <section class="booking-hero">
          <h1>Book Your Workspace</h1>
          <p>Select your ideal space and schedule your booking in just a few steps.</p>
        </section>

        <!-- Booking Form -->
        <section class="booking-form-container">
          <div class="form-card">
            <h2>Booking Details</h2>
            
            <form [formGroup]="bookingForm" (ngSubmit)="submitBooking()">
              <!-- Step 1: Select Space -->
              <div class="form-section">
                <h3>1. Select Space</h3>
                <div class="form-group">
                  <label for="space-select">Choose a Workspace</label>
                  <select id="space-select" formControlName="spaceId" class="form-control">
                    <option value="">-- Select Space --</option>
                    <option *ngFor="let space of availableSpaces()" [value]="space.id">
                      {{ space.name }} - {{ '$' + space.price }}/day (Capacity: {{ space.capacity }})
                    </option>
                  </select>
                  <small class="error-text" *ngIf="isFieldInvalid('spaceId')">Please select a space</small>
                </div>
              </div>

              <!-- Step 2: Select Dates -->
              <div class="form-section">
                <h3>2. Select Dates</h3>
                <div class="form-row">
                  <div class="form-group form-col">
                    <label for="start-date">Start Date</label>
                    <input 
                      id="start-date"
                      type="date"
                      formControlName="startDate"
                      class="form-control"
                      [min]="minDate">
                    <small class="error-text" *ngIf="isFieldInvalid('startDate')">Start date is required</small>
                  </div>
                  <div class="form-group form-col">
                    <label for="end-date">End Date</label>
                    <input 
                      id="end-date"
                      type="date"
                      formControlName="endDate"
                      class="form-control"
                      [min]="getStartDate()">
                    <small class="error-text" *ngIf="isFieldInvalid('endDate')">End date is required</small>
                  </div>
                </div>
              </div>

              <!-- Step 3: Booking Type -->
              <div class="form-section">
                <h3>3. Booking Type</h3>
                <div class="form-group">
                  <div class="radio-group">
                    <label class="radio-label">
                      <input type="radio" formControlName="billingType" value="hourly">
                      <span>Hourly Rate</span>
                    </label>
                    <label class="radio-label">
                      <input type="radio" formControlName="billingType" value="daily">
                      <span>Daily Rate</span>
                    </label>
                    <label class="radio-label">
                      <input type="radio" formControlName="billingType" value="monthly">
                      <span>Monthly Rate</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Step 4: Time Selection (if hourly) -->
              <div class="form-section" *ngIf="bookingForm.get('billingType')?.value === 'hourly'">
                <h3>4. Time Selection</h3>
                <div class="form-row">
                  <div class="form-group form-col">
                    <label for="start-time">Start Time</label>
                    <input 
                      id="start-time"
                      type="time"
                      formControlName="startTime"
                      class="form-control">
                  </div>
                  <div class="form-group form-col">
                    <label for="end-time">End Time</label>
                    <input 
                      id="end-time"
                      type="time"
                      formControlName="endTime"
                      class="form-control">
                  </div>
                </div>
              </div>

              <!-- Step 5: Recurrence -->
              <div class="form-section">
                <h3>5. Recurrence (Optional)</h3>
                <div class="form-group">
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      formControlName="isRecurring"
                      (change)="onRecurringChange()">
                    <span>Make this a recurring booking</span>
                  </label>
                </div>

                <div *ngIf="bookingForm.get('isRecurring')?.value" class="recurrence-options">
                  <div class="form-group">
                    <label for="recurrence-pattern">Repeat Pattern</label>
                    <select id="recurrence-pattern" formControlName="recurrencePattern" class="form-control">
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Every 2 Weeks</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="recurrence-end">Repeat Until</label>
                    <input 
                      id="recurrence-end"
                      type="date"
                      formControlName="recurrenceEnd"
                      class="form-control"
                      [min]="getEndDate()">
                  </div>
                </div>
              </div>

              <!-- Step 6: Special Requests -->
              <div class="form-section">
                <h3>6. Special Requests (Optional)</h3>
                <div class="form-group">
                  <label for="requests">Additional Notes</label>
                  <textarea 
                    id="requests"
                    formControlName="specialRequests"
                    class="form-control"
                    placeholder="E.g., need parking, specific equipment, etc."
                    rows="3"></textarea>
                </div>
              </div>

              <!-- Summary -->
              <div class="booking-summary" *ngIf="getSelectedSpace() as selectedSpace">
                <h3>Booking Summary</h3>
                <div class="summary-row">
                  <span>Space:</span>
                  <strong>{{ selectedSpace.name }}</strong>
                </div>
                <div class="summary-row">
                  <span>Type:</span>
                  <strong>{{ selectedSpace.type }}</strong>
                </div>
                <div class="summary-row">
                  <span>Rate:</span>
                  <strong>{{ '$' + selectedSpace.price }}/day</strong>
                </div>
                <div class="summary-row">
                  <span>Duration:</span>
                  <strong>{{ getDurationDays() }} day(s)</strong>
                </div>
                <div class="summary-row total">
                  <span>Estimated Total:</span>
                  <strong>{{ '$' + calculateTotal() }}</strong>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="form-actions">
                <button type="button" class="btn-secondary" (click)="resetForm()">Reset Form</button>
                <button 
                  type="submit" 
                  class="btn-primary btn-success"
                  [disabled]="bookingForm.invalid">
                  <i class="pi pi-check"></i>
                  Confirm Booking
                </button>
              </div>
            </form>

            <!-- Success Message -->
            <div class="success-message" *ngIf="bookingSuccess">
              <i class="pi pi-check-circle"></i>
              <p>Your booking has been submitted successfully! You will receive a confirmation email shortly.</p>
              <button type="button" class="btn-primary" (click)="resetForm()">Book Another Space</button>
            </div>
          </div>

          <!-- Booking Info Card -->
          <aside class="booking-info">
            <h3>Booking Information</h3>
            <div class="info-card">
              <h4>💡 How It Works</h4>
              <ol>
                <li>Select the workspace that fits your needs</li>
                <li>Choose your preferred dates</li>
                <li>Select hourly, daily, or monthly billing</li>
                <li>Set up recurrence if needed</li>
                <li>Add any special requests</li>
                <li>Confirm your booking</li>
              </ol>
            </div>

            <div class="info-card">
              <h4>📋 Important Notes</h4>
              <ul>
                <li>Minimum booking: 1 hour for hourly, 1 day for daily</li>
                <li>Cancellations must be made 24 hours in advance</li>
                <li>You can modify or cancel anytime from your account</li>
                <li>Payment is secured & PCI compliant</li>
              </ul>
            </div>

            <div class="info-card pricing">
              <h4>💰 Pricing Tiers</h4>
              <div class="price-tier">
                <span>Hourly:</span>
                <strong>$10-20</strong>
              </div>
              <div class="price-tier">
                <span>Daily:</span>
                <strong>$50-300</strong>
              </div>
              <div class="price-tier">
                <span>Monthly:</span>
                <strong>$500-2000</strong>
              </div>
            </div>
          </aside>
        </section>
      </main>
      <app-footer></app-footer>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep {
        .page-shell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f8fafc;
        }
        .content-shell {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
          flex: 1;
          width: 100%;
        }

        /* Hero */
        .booking-hero {
          margin-bottom: 3rem;
        }
        .booking-hero h1 {
          font-size: 2.5rem;
          color: #0f172a;
          margin: 0 0 1rem;
        }
        .booking-hero p {
          color: #475569;
          margin: 0;
          font-size: 1.1rem;
        }

        /* Form Container */
        .booking-form-container {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .form-card {
          background: white;
          border-radius: 1.25rem;
          padding: 2rem;
          border: 1px solid rgba(148, 163, 184, 0.1);
        }
        .form-card h2 {
          margin: 0 0 2rem;
          color: #0f172a;
          font-size: 1.5rem;
        }

        /* Form Sections */
        .form-section {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }
        .form-section:last-of-type {
          border-bottom: none;
        }
        .form-section h3 {
          margin: 0 0 1rem;
          color: #0f172a;
          font-size: 1.1rem;
        }

        /* Form Groups */
        .form-group {
          margin-bottom: 1rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #0f172a;
          font-size: 0.95rem;
        }

        .form-control {
          width: 100%;
          padding: 0.7rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.95rem;
          color: #0f172a;
          font-family: inherit;
        }
        .form-control:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        /* Form Rows */
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .form-col {
          margin-bottom: 0;
        }

        /* Radio & Checkbox */
        .radio-group,
        .checkbox-label {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .radio-label,
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          font-weight: 500;
          color: #0f172a;
        }
        .radio-label input,
        .checkbox-label input {
          cursor: pointer;
          width: 18px;
          height: 18px;
        }

        /* Recurrence Options */
        .recurrence-options {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-top: 1rem;
        }

        /* Summary */
        .booking-summary {
          background: #f0f9ff;
          border: 2px solid #2563eb;
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }
        .booking-summary h3 {
          margin: 0 0 1rem;
          color: #1e40af;
          font-size: 1.1rem;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
          color: #0f172a;
        }
        .summary-row span {
          color: #475569;
        }
        .summary-row.total {
          border-top: 2px solid #dbeafe;
          padding-top: 0.75rem;
          margin-top: 0.75rem;
          font-size: 1.1rem;
        }

        /* Buttons */
        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }
        .btn-primary,
        .btn-secondary {
          padding: 0.8rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
        }
        .btn-secondary {
          background: #f1f5f9;
          color: #475569;
          flex: 0;
        }
        .btn-secondary:hover {
          background: #e2e8f0;
        }
        .btn-primary {
          background: #2563eb;
          color: white;
          flex: 1;
        }
        .btn-primary:hover:not(:disabled) {
          background: #1d4ed8;
        }
        .btn-primary.btn-success {
          background: #10b981;
        }
        .btn-primary.btn-success:hover:not(:disabled) {
          background: #059669;
        }
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Error Text */
        .error-text {
          display: block;
          margin-top: 0.25rem;
          color: #ef4444;
          font-size: 0.85rem;
        }

        /* Success Message */
        .success-message {
          background: #f0fdf4;
          border: 2px solid #10b981;
          border-radius: 0.75rem;
          padding: 2rem;
          text-align: center;
        }
        .success-message i {
          display: block;
          font-size: 3rem;
          color: #10b981;
          margin-bottom: 1rem;
        }
        .success-message p {
          margin: 0 0 1rem;
          color: #065f46;
          font-size: 1.1rem;
        }

        /* Sidebar */
        .booking-info {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .booking-info h3 {
          margin: 0 0 1rem;
          color: #0f172a;
          font-size: 1.2rem;
        }
        .info-card {
          background: white;
          border-radius: 1.25rem;
          padding: 1.5rem;
          border: 1px solid rgba(148, 163, 184, 0.1);
        }
        .info-card h4 {
          margin: 0 0 1rem;
          color: #0f172a;
          font-size: 1rem;
        }
        .info-card ol,
        .info-card ul {
          margin: 0;
          padding-left: 1.5rem;
        }
        .info-card li {
          margin-bottom: 0.5rem;
          color: #475569;
        }
        .price-tier {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }
        .price-tier:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        .price-tier span {
          color: #475569;
        }
        .price-tier strong {
          color: #2563eb;
          font-weight: 700;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .booking-form-container {
            grid-template-columns: 1fr;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .content-shell {
            padding: 1.5rem 1rem;
          }
          .booking-hero h1 {
            font-size: 2rem;
          }
          .form-card {
            padding: 1.5rem;
          }
          .form-actions {
            flex-direction: column;
          }
          .btn-secondary {
            flex: 1;
          }
        }
      }
    `,
  ],
})
export class BookingPageComponent implements OnInit {
  bookingForm!: FormGroup;
  bookingSuccess = false;
  minDate = this.getTodayString();

  availableSpaces = signal<BookingSpace[]>([
    { id: 1, name: 'Downtown Desk #1', type: 'Desk', price: 25, capacity: 1 },
    { id: 2, name: 'Collaborative Space', type: 'Open Space', price: 150, capacity: 10 },
    { id: 3, name: 'Executive Meeting Room', type: 'Meeting Room', price: 75, capacity: 8 },
    { id: 4, name: 'Private Office Suite', type: 'Private Office', price: 120, capacity: 5 },
    { id: 5, name: 'Conference Hall', type: 'Conference', price: 300, capacity: 50 },
    { id: 6, name: 'Tech Startup Hub', type: 'Open Space', price: 200, capacity: 15 },
  ]);

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.bookingForm = this.fb.group({
      spaceId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      billingType: ['daily', Validators.required],
      startTime: ['09:00'],
      endTime: ['17:00'],
      isRecurring: [false],
      recurrencePattern: ['weekly'],
      recurrenceEnd: [''],
      specialRequests: [''],
    });
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

  getStartDate(): string {
    return this.bookingForm.get('startDate')?.value || this.minDate;
  }

  getEndDate(): string {
    return this.bookingForm.get('endDate')?.value || this.minDate;
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
    return space.price * days;
  }

  submitBooking() {
    if (this.bookingForm.invalid) {
      console.log('Form is invalid', this.bookingForm.errors);
      return;
    }

    const formData = this.bookingForm.value;
    console.log('Booking submitted:', formData);
    
    // Show success message
    this.bookingSuccess = true;
    
    // Reset form after 3 seconds
    setTimeout(() => {
      this.resetForm();
    }, 3000);
  }

  resetForm() {
    this.bookingForm.reset({
      billingType: 'daily',
      startTime: '09:00',
      endTime: '17:00',
      isRecurring: false,
      recurrencePattern: 'weekly',
    });
    this.bookingSuccess = false;
  }

  private getTodayString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
