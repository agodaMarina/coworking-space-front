import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-textarea',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TextareaComponent),
    multi: true,
  }],
  templateUrl: './textarea.component.html',
})
export class TextareaComponent implements ControlValueAccessor {
  @Input() placeholder = '';
  @Input() rows = 3;
  @Input() disabled = false;

  value = '';

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  onInput(event: Event): void {
    this.value = (event.target as HTMLTextAreaElement).value;
    this.onChange(this.value);
  }

  onBlur(): void { this.onTouched(); }

  writeValue(val: string): void { this.value = val ?? ''; }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }
}
