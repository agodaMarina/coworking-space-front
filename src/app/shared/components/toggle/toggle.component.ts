import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-toggle',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ToggleComponent),
    multi: true,
  }],
  templateUrl: './toggle.component.html',
})
export class ToggleComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() disabled = false;

  checked = false;

  private onChange: (v: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  toggle(): void {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.onChange(this.checked);
    this.onTouched();
  }

  writeValue(val: boolean): void { this.checked = !!val; }
  registerOnChange(fn: (v: boolean) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }
}
