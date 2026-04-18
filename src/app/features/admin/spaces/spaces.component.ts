import { Component, computed, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../shared/components/input/input.component';
import { TextareaComponent } from '../../../shared/components/textarea/textarea.component';
import { SelectComponent, SelectOption } from '../../../shared/components/select/select.component';
import { ToggleComponent } from '../../../shared/components/toggle/toggle.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../core/services/toast.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { TableComponent } from '../../../shared/components/table/table.component';
import { ColumnComponent } from '../../../shared/components/table/column.component';

export interface AdminSpace {
  id: number;
  name: string;
  type: string;
  typeDisplay: string;
  capacity: number;
  pricePerHour: number;
  pricePerDay: number;
  available: boolean;
  address: string;
  description: string;
}

@Component({
  standalone: true,
  selector: 'app-admin-spaces',
  imports: [NgClass, ReactiveFormsModule, InputComponent, TextareaComponent, SelectComponent, ToggleComponent, ConfirmDialogComponent, PaginationComponent, TableComponent, ColumnComponent],
  templateUrl: './spaces.component.html',
})
export class AdminSpacesComponent {
  readonly search = signal('');
  readonly filterType = signal<string | null>(null);
  readonly filterControl = new FormControl<string | null>(null);
  readonly page     = signal(1);
  readonly pageSize = 8;
  readonly showModal = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly pendingDeleteId = signal<number | null>(null);

  readonly form: FormGroup;

  readonly filterOptions: SelectOption<string | null>[] = [
    { label: 'All types',      value: null },
    { label: 'Hot Desk',       value: 'desk' },
    { label: 'Open Space',     value: 'open_space' },
    { label: 'Meeting Room',   value: 'meeting_room' },
    { label: 'Private Office', value: 'private' },
    { label: 'Conference',     value: 'conference' },
  ];

  readonly typeOptions: SelectOption<string>[] = [
    { label: 'Hot Desk',       value: 'desk',         badge: 'bg-[#CEF09D] text-black' },
    { label: 'Open Space',     value: 'open_space',   badge: 'bg-[#AEE9F4] text-black' },
    { label: 'Meeting Room',   value: 'meeting_room', badge: 'bg-[#FBCBE3] text-black' },
    { label: 'Private Office', value: 'private',      badge: 'bg-[#FDD5AB] text-black' },
    { label: 'Conference',     value: 'conference',   badge: 'bg-[#E2F89C] text-black' },
  ];

  readonly spaces = signal<AdminSpace[]>([
    { id: 1, name: 'Open Space A',     type: 'open_space',   typeDisplay: 'Open Space',     capacity: 20, pricePerHour: 8,  pricePerDay: 50,  available: true,  address: '12 Rue du Cowork',    description: 'Espace de travail partagé lumineux.' },
    { id: 2, name: 'Meeting Room 1',   type: 'meeting_room', typeDisplay: 'Meeting Room',   capacity: 8,  pricePerHour: 20, pricePerDay: 120, available: true,  address: '12 Rue du Cowork',    description: 'Salle de réunion avec vidéoprojecteur.' },
    { id: 3, name: 'Private Office 3', type: 'private',      typeDisplay: 'Private Office', capacity: 4,  pricePerHour: 30, pricePerDay: 200, available: false, address: '8 Avenue Centrale',   description: 'Bureau privatif climatisé.' },
    { id: 4, name: 'Hot Desk B',       type: 'desk',         typeDisplay: 'Hot Desk',       capacity: 1,  pricePerHour: 5,  pricePerDay: 25,  available: true,  address: '12 Rue du Cowork',    description: 'Poste de travail flexible.' },
    { id: 5, name: 'Conference Hall',  type: 'conference',   typeDisplay: 'Conference',     capacity: 50, pricePerHour: 60, pricePerDay: 400, available: true,  address: '3 Place des Affaires', description: 'Grande salle de conférence.' },
    { id: 6, name: 'Open Space B',     type: 'open_space',   typeDisplay: 'Open Space',     capacity: 15, pricePerHour: 7,  pricePerDay: 40,  available: false, address: '8 Avenue Centrale',   description: 'Espace ouvert en rez-de-chaussée.' },
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

  readonly modalTitle = computed(() => this.editingId() !== null ? 'Edit space' : 'New space');
  readonly submitLabel = computed(() => this.editingId() !== null ? 'Save changes' : 'Create space');

  readonly paginated = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  constructor(private fb: FormBuilder, private toast: ToastService) {
    this.filterControl.valueChanges.subscribe(v => { this.filterType.set(v); this.page.set(1); });

    this.form = this.fb.group({
      name:         ['', Validators.required],
      type:         ['desk', Validators.required],
      address:      ['', Validators.required],
      description:  [''],
      capacity:     [null],
      pricePerHour: [null],
      pricePerDay:  [null],
      available:    [true],
    });
  }

  typeBadge(type: string): string {
    return this.typeOptions.find(o => o.value === type)?.badge ?? 'bg-zinc-100 text-zinc-600';
  }

  typeDisplay(type: string): string {
    return this.typeOptions.find(o => o.value === type)?.label ?? type;
  }

  toggleAvailability(id: number): void {
    this.spaces.update(list =>
      list.map(s => s.id === id ? { ...s, available: !s.available } : s)
    );
    this.toast.showSuccess('Space availability updated.');
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ type: 'desk', available: true });
    this.showModal.set(true);
  }

  openEdit(s: AdminSpace): void {
    this.editingId.set(s.id);
    this.form.patchValue(s);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveForm(): void {
    if (this.form.invalid) return;
    const v = this.form.value;
    const typeDisp = this.typeDisplay(v.type);
    const id = this.editingId();

    if (id !== null) {
      this.spaces.update(list =>
        list.map(s => s.id === id ? { ...s, ...v, typeDisplay: typeDisp } : s)
      );
      this.toast.showSuccess('Space updated.');
    } else {
      const newId = Math.max(0, ...this.spaces().map(s => s.id)) + 1;
      this.spaces.update(list => [...list, { id: newId, typeDisplay: typeDisp, ...v }]);
      this.toast.showSuccess('Space created.');
    }
    this.closeModal();
  }

  askDelete(id: number): void {
    this.pendingDeleteId.set(id);
  }

  confirmDelete(): void {
    const id = this.pendingDeleteId();
    if (id === null) return;
    this.spaces.update(list => list.filter(s => s.id !== id));
    this.pendingDeleteId.set(null);
    this.toast.showSuccess('Space deleted.');
  }

  cancelDelete(): void {
    this.pendingDeleteId.set(null);
  }
}
