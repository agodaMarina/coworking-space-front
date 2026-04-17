import { Component, Input, forwardRef, signal, computed } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-date-picker',
  imports: [NgClass],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DatePickerComponent),
    multi: true,
  }],
  templateUrl: './date-picker.component.html',
})
export class DatePickerComponent implements ControlValueAccessor {
  @Input() min?: string;
  @Input() placeholder = 'Select date…';

  isOpen   = signal(false);
  selected = signal('');
  viewMonth = signal(new Date().getMonth());
  viewYear  = signal(new Date().getFullYear());

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  readonly MONTHS = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];
  readonly DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  readonly cells = computed(() => {
    const y = this.viewYear(), m = this.viewMonth();
    const first    = new Date(y, m, 1).getDay();
    const total    = new Date(y, m + 1, 0).getDate();
    const days: (number | null)[] = Array(first).fill(null);
    for (let d = 1; d <= total; d++) days.push(d);
    while (days.length % 7 !== 0) days.push(null);
    return days;
  });

  readonly displayValue = computed(() => {
    const v = this.selected();
    if (!v) return '';
    const d = new Date(v + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  });

  toDateStr(day: number): string {
    const m = String(this.viewMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${this.viewYear()}-${m}-${d}`;
  }

  isDisabled(day: number): boolean {
    return !!this.min && this.toDateStr(day) < this.min;
  }

  isSelected(day: number): boolean {
    return this.selected() === this.toDateStr(day);
  }

  isToday(day: number): boolean {
    const t = new Date();
    return t.getFullYear() === this.viewYear() &&
           t.getMonth()    === this.viewMonth() &&
           t.getDate()     === day;
  }

  prevMonth(): void {
    const m = this.viewMonth();
    if (m === 0) { this.viewMonth.set(11); this.viewYear.update(y => y - 1); }
    else this.viewMonth.set(m - 1);
  }

  nextMonth(): void {
    const m = this.viewMonth();
    if (m === 11) { this.viewMonth.set(0); this.viewYear.update(y => y + 1); }
    else this.viewMonth.set(m + 1);
  }

  selectDay(day: number): void {
    if (this.isDisabled(day)) return;
    const val = this.toDateStr(day);
    this.selected.set(val);
    this.onChange(val);
    this.onTouched();
    this.isOpen.set(false);
  }

  writeValue(val: string): void {
    this.selected.set(val || '');
    if (val) {
      const d = new Date(val + 'T00:00:00');
      this.viewMonth.set(d.getMonth());
      this.viewYear.set(d.getFullYear());
    }
  }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
}
