import { Component, computed, signal } from '@angular/core';
import { NgClass } from '@angular/common';

export interface Equipment {
  id: number;
  name: string;
  space: string;
  quantity: number;
  condition: 'good' | 'fair' | 'maintenance';
}

@Component({
  standalone: true,
  selector: 'app-admin-equipment',
  imports: [NgClass],
  templateUrl: './equipment.component.html',
})
export class AdminEquipmentComponent {
  readonly search = signal('');

  readonly equipment = signal<Equipment[]>([
    { id: 1,  name: 'Standing Desk',      space: 'Open Space A',     quantity: 10, condition: 'good'        },
    { id: 2,  name: 'Ergonomic Chair',     space: 'Open Space A',     quantity: 20, condition: 'good'        },
    { id: 3,  name: 'Projector',           space: 'Meeting Room 1',   quantity: 1,  condition: 'good'        },
    { id: 4,  name: 'Whiteboard',          space: 'Meeting Room 1',   quantity: 2,  condition: 'fair'        },
    { id: 5,  name: 'Video Conference Kit',space: 'Conference Hall',   quantity: 1,  condition: 'good'        },
    { id: 6,  name: 'Monitor 27"',         space: 'Private Office 3', quantity: 4,  condition: 'good'        },
    { id: 7,  name: 'Printer',             space: 'Open Space B',     quantity: 1,  condition: 'maintenance' },
    { id: 8,  name: 'Locker',              space: 'Hot Desk B',       quantity: 15, condition: 'fair'        },
  ]);

  readonly filtered = computed(() => {
    const q = this.search().toLowerCase();
    return q
      ? this.equipment().filter(e => e.name.toLowerCase().includes(q) || e.space.toLowerCase().includes(q))
      : this.equipment();
  });

  readonly stats = computed(() => ({
    total:       this.equipment().reduce((sum, e) => sum + e.quantity, 0),
    good:        this.equipment().filter(e => e.condition === 'good').length,
    maintenance: this.equipment().filter(e => e.condition === 'maintenance').length,
  }));

  conditionBadge(condition: string): string {
    const map: Record<string, string> = {
      good:        'bg-[#CEF09D] text-zinc-800',
      fair:        'bg-[#FDD5AB] text-zinc-800',
      maintenance: 'bg-[#FBCBE3] text-zinc-800',
    };
    return map[condition] ?? 'bg-zinc-100 text-zinc-600';
  }

  deleteEquipment(id: number): void {
    this.equipment.update(list => list.filter(e => e.id !== id));
  }
}
