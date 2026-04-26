import { Component, computed, OnInit, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../core/services/toast.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { TableComponent } from '../../../shared/components/table/table.component';
import { ColumnComponent } from '../../../shared/components/table/column.component';
import { Amenity } from '../../../core/dtos/space';
import { SpacesService } from '../../../core/services/spaces.service';
import { MessageService } from 'primeng/api';

@Component({
  standalone: true,
  selector: 'app-admin-amenities',
  imports: [NgClass, ReactiveFormsModule, InputComponent, ConfirmDialogComponent, PaginationComponent, TableComponent, ColumnComponent],
  templateUrl: './amenities.component.html',
  providers: [MessageService],
})
export class AdminAmenitiesComponent implements OnInit {
  readonly search      = signal('');
  readonly page        = signal(1);
  readonly pageSize    = 10;
  readonly showModal   = signal(false);
  readonly isSaving    = signal(false);
  readonly pendingDeleteId = signal<number | null>(null);

  readonly amenities   = signal<Amenity[]>([]);

  readonly form: FormGroup;

  /** PrimeIcons clés disponibles pour les amenities */
  readonly iconOptions: { key: string; label: string }[] = [
    { key: 'wifi',          label: 'WiFi'        },
    { key: 'desktop',       label: 'PC/Écran'    },
    { key: 'video',         label: 'Vidéo'       },
    { key: 'print',         label: 'Imprimante'  },
    { key: 'phone',         label: 'Téléphone'   },
    { key: 'coffee',        label: 'Café'        },
    { key: 'sun',           label: 'Lumière'     },
    { key: 'lock',          label: 'Sécurité'    },
    { key: 'volume-up',     label: 'Audio'       },
    { key: 'users',         label: 'Salle'       },
    { key: 'bolt',          label: 'Énergie'     },
    { key: 'car',           label: 'Parking'     },
    { key: 'box',           label: 'Stockage'    },
    { key: 'file',          label: 'Documents'   },
    { key: 'headphones',    label: 'Casque'      },
    { key: 'star',          label: 'Premium'     },
    { key: 'building',      label: 'Salle conf.' },
    { key: 'circle',        label: 'Autre'       },
  ];

  readonly selectedIcon = signal('circle');

  readonly filtered = computed(() => {
    const q = this.search().toLowerCase();
    return q
      ? this.amenities().filter(a => a.name.toLowerCase().includes(q))
      : this.amenities();
  });

  readonly paginated = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  readonly stats = computed(() => ({
    total: this.amenities().length,
  }));

  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    private spacesService: SpacesService,
  ) {
    this.form = this.fb.group({
      name:     ['', Validators.required],
      icon_key: ['circle'],
    });

    this.form.get('icon_key')!.valueChanges.subscribe(v => {
      if (v) this.selectedIcon.set(v);
    });
  }

  ngOnInit(): void {
    this.spacesService.disableMocks();
    this.loadAmenities();
  }

  loadAmenities(): void {
    this.spacesService.getAmenities().subscribe({
      next: amenities => this.amenities.set(amenities),
      error: () => this.toast.showError('Impossible de charger les équipements.'),
    });
  }

  openCreate(): void {
    this.form.reset({ name: '', icon_key: 'circle' });
    this.selectedIcon.set('circle');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.isSaving.set(false);
  }

  selectIcon(iconKey: string): void {
    this.selectedIcon.set(iconKey);
    this.form.patchValue({ icon_key: iconKey });
  }

  saveForm(): void {
    if (this.form.invalid || this.isSaving()) return;
    const { name, icon_key } = this.form.value as { name: string; icon_key: string };

    this.isSaving.set(true);
    this.spacesService.createAmenity({ name: name.trim(), icon: icon_key || 'circle' }).subscribe({
      next: created => {
        this.amenities.update(list => [created, ...list]);
        this.isSaving.set(false);
        this.closeModal();
        this.toast.showSuccess('Équipement créé.');
      },
      error: () => {
        this.isSaving.set(false);
        this.toast.showError('Impossible de créer l\'équipement.');
      },
    });
  }

  askDelete(id: number): void {
    this.pendingDeleteId.set(id);
  }

  confirmDelete(): void {
    const id = this.pendingDeleteId();
    if (id === null) return;
    // No delete endpoint defined — remove locally
    this.amenities.update(list => list.filter(a => a.id !== id));
    this.pendingDeleteId.set(null);
    this.toast.showSuccess('Équipement supprimé.');
  }

  cancelDelete(): void {
    this.pendingDeleteId.set(null);
  }
}
