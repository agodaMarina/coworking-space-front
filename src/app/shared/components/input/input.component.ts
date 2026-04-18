import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-input',
  imports: [NgClass],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputComponent),
    multi: true,
  }],
  templateUrl: './input.component.html',
})
export class InputComponent implements ControlValueAccessor {
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() maxlength?: number;
  @Input() icon?: string;
  @Input() mono = false;
  @Input() disabled = false;

  value = '';

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  onInput(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }

  writeValue(val: string): void { this.value = val ?? ''; }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }
}
