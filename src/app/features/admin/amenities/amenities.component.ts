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

  /** Lucide icons available for quick selection */
  readonly iconOptions: string[] = [
    'lucide:wifi',
    'lucide:monitor',
    'lucide:tv-2',
    'lucide:printer',
    'lucide:phone',
    'lucide:coffee',
    'lucide:sun',
    'lucide:lock',
    'lucide:volume-2',
    'lucide:video',
    'lucide:projector',
    'lucide:users',
    'lucide:zap',
    'lucide:wind',
    'lucide:box',
    'lucide:layers',
    'lucide:file-text',
    'lucide:headphones',
    'lucide:sparkles',
    'lucide:star',
  ];

  readonly selectedIcon = signal('lucide:sparkles');

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
      name: ['', Validators.required],
      icon: ['lucide:sparkles'],
    });

    this.form.get('icon')!.valueChanges.subscribe(v => {
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
      error: () => this.toast.showError('Unable to load amenities.'),
    });
  }

  openCreate(): void {
    this.form.reset({ name: '', icon: 'lucide:sparkles' });
    this.selectedIcon.set('lucide:sparkles');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.isSaving.set(false);
  }

  selectIcon(icon: string): void {
    this.selectedIcon.set(icon);
    this.form.patchValue({ icon });
  }

  saveForm(): void {
    if (this.form.invalid || this.isSaving()) return;
    const { name, icon } = this.form.value as { name: string; icon: string };

    this.isSaving.set(true);
    this.spacesService.createAmenity({ name: name.trim(), icon: icon || 'lucide:sparkles' }).subscribe({
      next: created => {
        this.amenities.update(list => [created, ...list]);
        this.isSaving.set(false);
        this.closeModal();
        this.toast.showSuccess('Amenity created.');
      },
      error: () => {
        this.isSaving.set(false);
        this.toast.showError('Unable to create amenity.');
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
    this.toast.showSuccess('Amenity removed.');
  }

  cancelDelete(): void {
    this.pendingDeleteId.set(null);
  }
}
