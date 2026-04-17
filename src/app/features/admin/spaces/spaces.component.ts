import { Component, computed, signal } from '@angular/core';
import { NgClass } from '@angular/common';

export interface AdminSpace {
  id: number;
  name: string;
  type: string;
  typeDisplay: string;
  capacity: number;
  pricePerDay: number;
  available: boolean;
  address: string;
}

@Component({
  standalone: true,
  selector: 'app-admin-spaces',
  imports: [NgClass],
  templateUrl: './spaces.component.html',
})
export class AdminSpacesComponent {
  readonly search = signal('');
  readonly filterType = signal<string | null>(null);

  readonly typeOptions = [
    { label: 'All types',       value: null },
    { label: 'Hot Desk',        value: 'desk' },
    { label: 'Open Space',      value: 'open_space' },
    { label: 'Meeting Room',    value: 'meeting_room' },
    { label: 'Private Office',  value: 'private' },
    { label: 'Conference',      value: 'conference' },
  ];

  readonly spaces = signal<AdminSpace[]>([
    { id: 1, name: 'Open Space A',      type: 'open_space',   typeDisplay: 'Open Space',     capacity: 20, pricePerDay: 50,  available: true,  address: '12 Rue du Cowork' },
    { id: 2, name: 'Meeting Room 1',    type: 'meeting_room', typeDisplay: 'Meeting Room',   capacity: 8,  pricePerDay: 120, available: true,  address: '12 Rue du Cowork' },
    { id: 3, name: 'Private Office 3',  type: 'private',      typeDisplay: 'Private Office', capacity: 4,  pricePerDay: 200, available: false, address: '8 Avenue Centrale' },
    { id: 4, name: 'Hot Desk B',        type: 'desk',         typeDisplay: 'Hot Desk',       capacity: 1,  pricePerDay: 25,  available: true,  address: '12 Rue du Cowork' },
    { id: 5, name: 'Conference Hall',   type: 'conference',   typeDisplay: 'Conference',     capacity: 50, pricePerDay: 400, available: true,  address: '3 Place des Affaires' },
    { id: 6, name: 'Open Space B',      type: 'open_space',   typeDisplay: 'Open Space',     capacity: 15, pricePerDay: 40,  available: false, address: '8 Avenue Centrale' },
  ]);

  readonly filtered = computed(() => {
    const q = this.search().toLowerCase();
    const t = this.filterType();
    return this.spaces().filter(s =>
      (!q || s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q)) &&
      (!t || s.type === t)
    );
  });

  readonly stats = computed(() => ({
    total:       this.spaces().length,
    available:   this.spaces().filter(s => s.available).length,
    unavailable: this.spaces().filter(s => !s.available).length,
  }));

  typeBadge(type: string): string {
    const map: Record<string, string> = {
      desk:         'bg-[#CEF09D] text-black',
      open_space:   'bg-[#AEE9F4] text-black',
      meeting_room: 'bg-[#FBCBE3] text-black',
      private:      'bg-[#FDD5AB] text-black',
      conference:   'bg-[#E2F89C] text-black',
    };
    return map[type] ?? 'bg-zinc-100 text-zinc-600';
  }

  toggleAvailability(id: number): void {
    this.spaces.update(list =>
      list.map(s => s.id === id ? { ...s, available: !s.available } : s)
    );
  }
}
