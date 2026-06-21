import { DatePipe, NgClass } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Equipment } from '../../../core/dtos/equipment';
import { Room, RoomWritePayload } from '../../../core/dtos/room';
import { EquipmentsService } from '../../../core/services/equipments.service';
import { RoomsService } from '../../../core/services/rooms.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ToggleComponent } from '../../../shared/components/toggle/toggle.component';

@Component({
  standalone: true,
  selector: 'app-admin-spaces',
  imports: [NgClass, DatePipe, ReactiveFormsModule,
            InputComponent, ToggleComponent,
            ConfirmDialogComponent, PaginationComponent],
  templateUrl: './spaces.component.html',
  providers: [MessageService],
})
export class AdminSpacesComponent implements OnInit {
  private readonly roomsService       = inject(RoomsService);
  private readonly equipmentsService  = inject(EquipmentsService);
  private readonly toast              = inject(ToastService);
  private readonly fb                 = inject(FormBuilder);

  readonly rooms            = signal<Room[]>([]);
  readonly allEquipments    = signal<Equipment[]>([]);
  readonly nextCursor       = signal<string | null>(null);
  readonly hasMore          = signal(false);
  readonly search           = signal('');
  readonly page             = signal(1);
  readonly pageSize         = 8;
  readonly showModal        = signal(false);
  readonly editingRoom      = signal<Room | null>(null);
  readonly pendingDeleteId  = signal<string | null>(null);
  readonly isSaving         = signal(false);
  readonly isLoading        = this.roomsService.isLoading;

  readonly form: FormGroup;

  readonly filtered = computed(() => {
    const q = this.search().toLowerCase();
    return q
      ? this.rooms().filter(r => r.name.toLowerCase().includes(q))
      : this.rooms();
  });

  readonly paginated = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  readonly stats = computed(() => ({
    total:    this.rooms().length,
    capacity: this.rooms().reduce((sum, r) => sum + r.capacity, 0),
  }));

  readonly modalTitle  = computed(() => this.editingRoom() ? 'Modifier la salle' : 'Nouvelle salle');
  readonly submitLabel = computed(() => this.editingRoom() ? 'Enregistrer' : 'Créer');

  constructor() {
    this.form = this.fb.group({
      name:                        ['', Validators.required],
      capacity:                    [1, [Validators.required, Validators.min(1)]],
      gap_minutes:                 [0, Validators.min(0)],
      cancellation_allowed:        [true],
      cancellation_deadline_hours: [0, Validators.min(0)],
    });
  }

  ngOnInit(): void {
    this.loadRooms();
    this.loadEquipments();
  }

  loadRooms(append = false): void {
    const cursor = append ? this.nextCursor() : null;
    this.roomsService.getRooms({ limit: 100, ...(cursor ? { cursor } : {}) }).subscribe({
      next: (res) => {
        this.rooms.set(append ? [...this.rooms(), ...res.items] : res.items);
        this.nextCursor.set(res.next_cursor);
        this.hasMore.set(res.has_more);
      },
      error: () => this.toast.showError('Impossible de charger les salles.'),
    });
  }

  loadEquipments(): void {
    this.equipmentsService.getEquipments({ limit: 100 }).subscribe({
      next: (res) => this.allEquipments.set(res.items),
    });
  }

  // ── Modal création / édition ────────────────────────────────────────────────

  openCreate(): void {
    this.editingRoom.set(null);
    this.form.reset({
      name: '', capacity: 1, gap_minutes: 0,
      cancellation_allowed: true, cancellation_deadline_hours: 0,
    });
    this.showModal.set(true);
  }

  openEdit(room: Room): void {
    this.editingRoom.set(room);
    this.form.patchValue({
      name:                        room.name,
      capacity:                    room.capacity,
      gap_minutes:                 room.gap_minutes,
      cancellation_allowed:        room.cancellation_allowed,
      cancellation_deadline_hours: room.cancellation_deadline_hours,
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingRoom.set(null);
  }

  saveForm(): void {
    if (this.form.invalid || this.isSaving()) return;

    const payload: RoomWritePayload = {
      name:                        this.form.value.name,
      capacity:                    Number(this.form.value.capacity),
      gap_minutes:                 Number(this.form.value.gap_minutes ?? 0),
      cancellation_allowed:        !!this.form.value.cancellation_allowed,
      cancellation_deadline_hours: Number(this.form.value.cancellation_deadline_hours ?? 0),
    };

    const editing = this.editingRoom();
    this.isSaving.set(true);

    const request = editing
      ? this.roomsService.updateRoom(editing.id, { ...payload, version: editing.version })
      : this.roomsService.createRoom(payload);

    request.subscribe({
      next: (room) => {
        if (editing) {
          this.rooms.update(list => list.map(r => r.id === room.id ? room : r));
          this.toast.showSuccess('Salle mise à jour.');
        } else {
          this.rooms.update(list => [room, ...list]);
          this.toast.showSuccess('Salle créée.');
        }
        this.isSaving.set(false);
        this.closeModal();
      },
      error: () => {
        this.isSaving.set(false);
        this.toast.showError(editing ? 'Impossible de modifier la salle.' : 'Impossible de créer la salle.');
      },
    });
  }

  // ── Suppression ─────────────────────────────────────────────────────────────

  askDelete(id: string): void {
    this.pendingDeleteId.set(id);
  }

  confirmDelete(): void {
    const id = this.pendingDeleteId();
    if (!id) return;
    this.roomsService.deleteRoom(id).subscribe({
      next: () => {
        this.rooms.update(list => list.filter(r => r.id !== id));
        this.pendingDeleteId.set(null);
        this.toast.showSuccess('Salle supprimée.');
      },
      error: () => this.toast.showError('Impossible de supprimer la salle.'),
    });
  }

  cancelDelete(): void {
    this.pendingDeleteId.set(null);
  }

  // ── Équipements d'une salle ─────────────────────────────────────────────────

  isEquipmentAssigned(room: Room, equipmentId: string): boolean {
    return room.equipments?.some(e => e.id === equipmentId) ?? false;
  }

  toggleEquipment(room: Room, equipmentId: string, assigned: boolean): void {
    const request = assigned
      ? this.roomsService.removeEquipmentFromRoom(room.id, equipmentId)
      : this.roomsService.addEquipmentToRoom(room.id, equipmentId);

    request.subscribe({
      next: (updated) => {
        this.rooms.update(list => list.map(r => r.id === updated.id ? updated : r));
        if (this.editingRoom()?.id === updated.id) {
          this.editingRoom.set(updated);
        }
      },
      error: () => this.toast.showError('Impossible de modifier les équipements de la salle.'),
    });
  }

  // ── Helpers d'affichage ─────────────────────────────────────────────────────

  activeReservationsCount(room: Room): number {
    const now = new Date();
    return room.reservations?.filter(r => new Date(r.end_time) > now).length ?? 0;
  }
}
