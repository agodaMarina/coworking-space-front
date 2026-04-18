import { Component, ContentChild, Input, TemplateRef } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-column',
  template: '',
})
export class ColumnComponent {
  @Input() label = '';
  @Input() width?: string;
  @Input() flex = '';
  @Input() align: 'left' | 'right' | 'center' = 'left';
  @Input() hideOnMobile = false;
  @ContentChild(TemplateRef) cell!: TemplateRef<{ $implicit: any }>;
}
