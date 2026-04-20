import { Component, computed, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../shared/components/input/input.component';
import { SelectComponent, SelectOption } from '../../../shared/components/select/select.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../core/services/toast.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { TableComponent } from '../../../shared/components/table/table.component';
import { ColumnComponent } from '../../../shared/components/table/column.component';
import { MessageService } from 'primeng/api';

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
  imports: [NgClass, ReactiveFormsModule, InputComponent, SelectComponent, ConfirmDialogComponent, PaginationComponent, TableComponent, ColumnComponent],
  templateUrl: './equipment.component.html',
  providers:[MessageService]
})
export class AdminEquipmentComponent {
  readonly search = signal('');
  readonly showModal = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly pendingDeleteId = signal<number | null>(null);
  readonly page     = signal(1);
  readonly pageSize = 8;



  readonly form: FormGroup;

  readonly spaceOptions: SelectOption<string>[] = [
    { label: 'Open Space A',     value: 'Open Space A' },
    { label: 'Meeting Room 1',   value: 'Meeting Room 1' },
    { label: 'Private Office 3', value: 'Private Office 3' },
    { label: 'Hot Desk B',       value: 'Hot Desk B' },
    { label: 'Conference Hall',  value: 'Conference Hall' },
    { label: 'Open Space B',     value: 'Open Space B' },
  ];

  readonly conditionOptions: SelectOption<'good' | 'fair' | 'maintenance'>[] = [
    { label: 'Good',        value: 'good',        badge: 'bg-[#CEF09D] text-zinc-800' },
    { label: 'Fair',        value: 'fair',        badge: 'bg-[#FDD5AB] text-zinc-800' },
    { label: 'Maintenance', value: 'maintenance', badge: 'bg-[#FBCBE3] text-zinc-800' },
  ];

  readonly equipment = signal<Equipment[]>([
    { id: 1,  name: 'Standing Desk',       space: 'Open Space A',     quantity: 10, condition: 'good'        },
    { id: 2,  name: 'Ergonomic Chair',      space: 'Open Space A',     quantity: 20, condition: 'good'        },
    { id: 3,  name: 'Projector',            space: 'Meeting Room 1',   quantity: 1,  condition: 'good'        },
    { id: 4,  name: 'Whiteboard',           space: 'Meeting Room 1',   quantity: 2,  condition: 'fair'        },
    { id: 5,  name: 'Video Conference Kit', space: 'Conference Hall',   quantity: 1,  condition: 'good'        },
    { id: 6,  name: 'Monitor 27"',          space: 'Private Office 3', quantity: 4,  condition: 'good'        },
    { id: 7,  name: 'Printer',              space: 'Open Space B',     quantity: 1,  condition: 'maintenance' },
    { id: 8,  name: 'Locker',               space: 'Hot Desk B',       quantity: 15, condition: 'fair'        },
  ]);

  readonly paginated = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

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

  readonly modalTitle = computed(() => this.editingId() !== null ? 'Edit equipment' : 'New equipment');
  readonly submitLabel = computed(() => this.editingId() !== null ? 'Save changes' : 'Create equipment');

  constructor(private fb: FormBuilder, private toast: ToastService) {
    this.form = this.fb.group({
      name:      ['', Validators.required],
      space:     ['Open Space A', Validators.required],
      quantity:  [null],
      condition: ['good', Validators.required],
    });
  }

  conditionBadge(condition: string): string {
    return this.conditionOptions.find(o => o.value === condition)?.badge ?? 'bg-zinc-100 text-zinc-600';
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ space: 'Open Space A', condition: 'good' });
    this.showModal.set(true);
  }

  openEdit(e: Equipment): void {
    this.editingId.set(e.id);
    this.form.patchValue(e);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveForm(): void {
    if (this.form.invalid) return;
    const v = this.form.value;
    const id = this.editingId();
    if (id !== null) {
      this.equipment.update(list => list.map(e => e.id === id ? { ...e, ...v } : e));
      this.toast.showSuccess('Equipement mis à jour.');
    } else {
      const newId = Math.max(0, ...this.equipment().map(e => e.id)) + 1;
      this.equipment.update(list => [...list, { id: newId, ...v }]);
      this.toast.showSuccess('Equipement créé.');
    }
    this.closeModal();
  }

  askDelete(id: number): void {
    this.pendingDeleteId.set(id);
  }

  confirmDelete(): void {
    const id = this.pendingDeleteId();
    if (id === null) return;
    this.equipment.update(list => list.filter(e => e.id !== id));
    this.pendingDeleteId.set(null);
    this.toast.showSuccess('Equipment deleted.');
  }

  cancelDelete(): void {
    this.pendingDeleteId.set(null);
  }
}
