import { NgClass } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Equipment } from '../../../core/dtos/equipment';
import { EquipmentsService } from '../../../core/services/equipments.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { TableComponent } from '../../../shared/components/table/table.component';
import { ColumnComponent } from '../../../shared/components/table/column.component';

@Component({
  standalone: true,
  selector: 'app-admin-equipment',
  imports: [NgClass, ReactiveFormsModule, InputComponent,
            ConfirmDialogComponent, PaginationComponent, TableComponent, ColumnComponent],
  templateUrl: './equipment.component.html',
  providers: [MessageService],
})
export class AdminEquipmentComponent implements OnInit {
  private readonly equipmentsService = inject(EquipmentsService);
  private readonly toast             = inject(ToastService);
  private readonly fb                = inject(FormBuilder);

  readonly equipment       = signal<Equipment[]>([]);
  readonly search          = signal('');
  readonly showModal       = signal(false);
  readonly editingId       = signal<string | null>(null);
  readonly pendingDeleteId = signal<string | null>(null);
  readonly isSaving        = signal(false);
  readonly page            = signal(1);
  readonly pageSize        = 8;
  readonly nextCursor      = signal<string | null>(null);
  readonly hasMore         = signal(false);

  readonly form: FormGroup;

  readonly filtered = computed(() => {
    const q = this.search().toLowerCase();
    return q
      ? this.equipment().filter(e => e.name.toLowerCase().includes(q))
      : this.equipment();
  });

  readonly paginated = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  readonly modalTitle  = computed(() => this.editingId() ? 'Modifier l\'équipement' : 'Nouvel équipement');
  readonly submitLabel = computed(() => this.editingId() ? 'Enregistrer' : 'Créer');

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  ngOnInit(): void {
    this.loadEquipments();
  }

  loadEquipments(append = false): void {
    const cursor = append ? this.nextCursor() : null;
    this.equipmentsService.getEquipments({ limit: 100, ...(cursor ? { cursor } : {}) }).subscribe({
      next: (res) => {
        this.equipment.set(append ? [...this.equipment(), ...res.items] : res.items);
        this.nextCursor.set(res.next_cursor);
        this.hasMore.set(res.has_more);
      },
      error: () => this.toast.showError('Impossible de charger les équipements.'),
    });
  }

  // ── Modal ──────────────────────────────────────────────────────────────────

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ name: '' });
    this.showModal.set(true);
  }

  openEdit(e: Equipment): void {
    this.editingId.set(e.id);
    this.form.patchValue({ name: e.name });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingId.set(null);
  }

  saveForm(): void {
    if (this.form.invalid || this.isSaving()) return;

    const name    = this.form.value.name as string;
    const editing = this.editingId();
    this.isSaving.set(true);

    const request = editing
      ? this.equipmentsService.updateEquipment(editing, { name })
      : this.equipmentsService.createEquipment({ name });

    request.subscribe({
      next: (eq) => {
        if (editing) {
          this.equipment.update(list => list.map(e => e.id === eq.id ? eq : e));
          this.toast.showSuccess('Équipement mis à jour.');
        } else {
          this.equipment.update(list => [eq, ...list]);
          this.toast.showSuccess('Équipement créé.');
        }
        this.isSaving.set(false);
        this.closeModal();
      },
      error: () => {
        this.isSaving.set(false);
        this.toast.showError(editing ? 'Impossible de modifier l\'équipement.' : 'Impossible de créer l\'équipement.');
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
    this.equipmentsService.deleteEquipment(id).subscribe({
      next: () => {
        this.equipment.update(list => list.filter(e => e.id !== id));
        this.pendingDeleteId.set(null);
        this.toast.showSuccess('Équipement supprimé.');
      },
      error: () => {
        this.pendingDeleteId.set(null);
        this.toast.showError('Impossible de supprimer l\'équipement. Il est peut-être encore utilisé par une salle.');
      },
    });
  }

  cancelDelete(): void {
    this.pendingDeleteId.set(null);
  }
}
