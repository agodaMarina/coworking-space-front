import { AfterContentInit, Component, ContentChildren, Input, QueryList } from '@angular/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { ColumnComponent } from './column.component';

@Component({
  standalone: true,
  selector: 'app-table',
  imports: [NgClass, NgTemplateOutlet],
  templateUrl: './table.component.html',
})
export class TableComponent implements AfterContentInit {
  @Input() rows: any[] = [];
  @Input() emptyMessage = 'No data found.';

  @ContentChildren(ColumnComponent) columns!: QueryList<ColumnComponent>;

  gridTemplate = '';

  ngAfterContentInit(): void {
    this.buildGrid();
    this.columns.changes.subscribe(() => this.buildGrid());
  }

  cols(): ColumnComponent[] {
    return this.columns?.toArray() ?? [];
  }

  private buildGrid(): void {
    this.gridTemplate = this.cols()
      .map(c => c.flex ? `${c.flex}fr` : (c.width ?? 'auto'))
      .join(' ');
  }
}
