import { Component, Input, Output, EventEmitter, computed, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-pagination',
  imports: [NgClass],
  templateUrl: './pagination.component.html',
})
export class PaginationComponent {
  @Input() total = 0;
  @Input() pageSize = 8;
  @Input() current = 1;
  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  get pages(): (number | '…')[] {
    const t = this.totalPages;
    const c = this.current;
    if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1);

    const pages: (number | '…')[] = [1];
    if (c > 3) pages.push('…');
    for (let p = Math.max(2, c - 1); p <= Math.min(t - 1, c + 1); p++) pages.push(p);
    if (c < t - 2) pages.push('…');
    pages.push(t);
    return pages;
  }

  go(p: number | '…'): void {
    if (p === '…' || p === this.current) return;
    this.pageChange.emit(p as number);
  }

  prev(): void {
    if (this.current > 1) this.pageChange.emit(this.current - 1);
  }

  next(): void {
    if (this.current < this.totalPages) this.pageChange.emit(this.current + 1);
  }
}
