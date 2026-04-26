import { Component, Input, forwardRef, signal, computed, HostListener } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgClass } from '@angular/common';

export interface SelectOption<T = string> {
  label: string;
  value: T;
  badge?: string; // optional Tailwind classes for a pastel badge
}

@Component({
  standalone: true,
  selector: 'app-select',
  imports: [NgClass],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SelectComponent),
    multi: true,
  }],
  templateUrl: './select.component.html',
})
export class SelectComponent<T = string> implements ControlValueAccessor {
  @Input() options: SelectOption<T>[] = [];
  @Input() placeholder = 'Select…';
  @Input() icon?: string;
  @Input() disabled = false;

  readonly isOpen   = signal(false);
  readonly selected = signal<T | null>(null);

  private onChange: (v: T | null) => void = () => {};
  private onTouched: () => void = () => {};

  readonly selectedOption = computed(() =>
    this.options.find(o => o.value === this.selected()) ?? null
  );

  toggle(): void {
    if (this.disabled) return;
    this.isOpen.update(v => !v);
  }

  close(): void {
    this.isOpen.set(false);
  }

  select(opt: SelectOption<T>): void {
    this.selected.set(opt.value);
    this.onChange(opt.value);
    this.onTouched();
    this.isOpen.set(false);
  }

  isSelected(opt: SelectOption<T>): boolean {
    return opt.value === this.selected();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  writeValue(val: T | null): void { this.selected.set(val ?? null); }
  registerOnChange(fn: (v: T | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }
}
