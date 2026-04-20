import { NgClass } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TableComponent } from '../../../shared/components/table/table.component';
import { ColumnComponent } from '../../../shared/components/table/column.component';
import { Space } from '../../../core/dtos/space';
import { SpacesService } from '../../../core/services/spaces.service';
import { MessageService } from 'primeng/api';

@Component({
  standalone: true,
  selector: 'app-dashboard-spaces',
  imports: [NgClass, RouterLink, TableComponent, ColumnComponent],
  templateUrl: './spaces.component.html',
  providers:[MessageService]
})
export class DashboardSpacesComponent implements OnInit {
  private readonly spacesService = inject(SpacesService);

  readonly spaces = signal<Space[]>([]);
  readonly isLoading = this.spacesService.isLoading;
  readonly search = signal('');
  readonly filterType = signal<string | null>(null);

  readonly typeOptions = [
    { label: 'All types', value: null },
    { label: 'Hot Desk', value: 'desk' },
    { label: 'Open Space', value: 'open_space' },
    { label: 'Meeting Room', value: 'meeting_room' },
    { label: 'Private Office', value: 'private' },
    { label: 'Conference', value: 'conference' },
  ];

  readonly filtered = computed(() => {
    const q = this.search().toLowerCase();
    const t = this.filterType();
    return this.spaces().filter(s =>
      (!q || s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q)) &&
      (!t || s.space_type === t)
    );
  });

  readonly stats = computed(() => {
    const all = this.spaces();
    return {
      total: all.length,
      available: all.filter(s => s.is_available).length,
      unavailable: all.filter(s => !s.is_available).length,
    };
  });

  private readonly typeBadgeColors: Record<string, string> = {
    desk: 'bg-[#CEF09D] text-black',
    open_space: 'bg-[#AEE9F4] text-black',
    meeting_room: 'bg-[#FBCBE3] text-black',
    private: 'bg-[#FDD5AB] text-black',
    conference: 'bg-[#E2F89C] text-black',
  };

  typeBadge(type: string): string {
    return this.typeBadgeColors[type] ?? 'bg-zinc-100 text-zinc-600';
  }

  ngOnInit(): void {
    this.spacesService.getSpaces().subscribe({
      next: spaces => this.spaces.set(spaces),
    });
  }

  toggleAvailability(space: Space): void {
    this.spaces.update(list =>
      list.map(s => s.id === space.id ? { ...s, is_available: !s.is_available } : s)
    );
  }
}
