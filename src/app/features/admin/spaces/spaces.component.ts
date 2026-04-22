import { Component, computed, OnInit, signal } from '@angular/core';
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
import { Amenity, Space, SpacePhoto, SpaceWritePayload } from '../../../core/dtos/space';
import { SpacesService } from '../../../core/services/spaces.service';
import { MessageService } from 'primeng/api';

@Component({
  standalone: true,
  selector: 'app-admin-spaces',
  imports: [NgClass, ReactiveFormsModule, InputComponent, TextareaComponent, SelectComponent, ToggleComponent, ConfirmDialogComponent, PaginationComponent, TableComponent, ColumnComponent],
  templateUrl: './spaces.component.html',
  providers:[MessageService]
})
export class AdminSpacesComponent implements OnInit {
  readonly search = signal('');
  readonly filterType = signal<string | null>(null);
  readonly filterControl = new FormControl<string | null>(null);
  readonly page     = signal(1);
  readonly pageSize = 8;
  readonly showModal = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly pendingDeleteId = signal<number | null>(null);
  readonly spaces = signal<Space[]>([]);
  readonly amenities = signal<Amenity[]>([]);
  readonly currentSpace = signal<Space | null>(null);
  readonly isSaving = signal(false);
  readonly isLoadingDetails = signal(false);
  readonly isUploadingPhoto = signal(false);
  readonly selectedPhotoFile = signal<File | null>(null);
  readonly selectedPhotoPreview = signal<string | null>(null);
  readonly selectedPhotoName = signal('');
  readonly selectedPhotoIsPrimary = signal(false);

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

  readonly filtered = computed(() => {
    const q = this.search().toLowerCase();
    const t = this.filterType();
    return this.spaces().filter(s =>
      (!q || s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q)) &&
      (!t || s.space_type === t)
    );
  });

  readonly stats = computed(() => ({
    total:       this.spaces().length,
    available:   this.spaces().filter(s => s.is_available).length,
    unavailable: this.spaces().filter(s => !s.is_available).length,
  }));

  readonly modalTitle = computed(() => this.editingId() !== null ? 'Edit space' : 'New space');
  readonly submitLabel = computed(() => this.editingId() !== null ? 'Save changes' : 'Create space');

  readonly paginated = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    private spacesService: SpacesService
  ) {
    this.filterControl.valueChanges.subscribe(v => { this.filterType.set(v); this.page.set(1); });

    this.form = this.fb.group({
      name:         ['', Validators.required],
      space_type:   ['desk', Validators.required],
      address:      ['', Validators.required],
      description:  [''],
      capacity:     [1, [Validators.required, Validators.min(0)]],
      price_per_hour: [0, [Validators.required, Validators.min(0)]],
      price_per_day:  [0, [Validators.required, Validators.min(0)]],
      is_available:   [true],
      amenities:      [[]],
    });
  }

  ngOnInit(): void {
    this.spacesService.disableMocks();
    this.loadSpaces();
    this.loadAmenities();
  }

  typeBadge(type: string): string {
    return this.typeOptions.find(o => o.value === type)?.badge ?? 'bg-zinc-100 text-zinc-600';
  }

  typeDisplay(type: string): string {
    return this.typeOptions.find(o => o.value === type)?.label ?? type;
  }

  loadSpaces(): void {
    this.spacesService.getSpaces().subscribe({
      next: spaces => this.spaces.set(spaces),
      error: () => this.toast.showError('Unable to load spaces.'),
    });
  }

  loadAmenities(): void {
    this.spacesService.getAmenities().subscribe({
      next: amenities => this.amenities.set(amenities),
      error: () => this.toast.showError('Unable to load amenities.'),
    });
  }

  toggleAvailability(space: Space): void {
    this.spacesService.patchSpace(space.id, { is_available: !space.is_available }).subscribe({
      next: updated => {
        this.mergeSpace(updated);
        this.toast.showSuccess('Space availability updated.');
      },
      error: () => this.toast.showError('Unable to update availability.'),
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.currentSpace.set(null);
    this.resetForm();
    this.clearSelectedPhoto();
    this.showModal.set(true);
  }

  openEdit(s: Space): void {
    this.editingId.set(s.id);
    this.currentSpace.set(s);
    this.patchForm(s);
    this.clearSelectedPhoto();
    this.showModal.set(true);
    this.loadSpaceDetail(s.id);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingId.set(null);
    this.currentSpace.set(null);
    this.isLoadingDetails.set(false);
    this.clearSelectedPhoto();
  }

  saveForm(): void {
    if (this.form.invalid || this.isSaving()) return;

    const id = this.editingId();
    const payload = this.buildPayload();
    const request = id !== null
      ? this.spacesService.updateSpace(id, payload)
      : this.spacesService.createSpace(payload);
    const successMsg = id !== null ? 'Space updated.' : 'Space created.';

    this.isSaving.set(true);
    request.subscribe({
      next: space => {
        if (space?.id > 0) {
          this.persistPendingPhoto(space, successMsg);
        } else {
          // Backend returned no id — reload list to find the real id
          this.spacesService.getSpaces().subscribe({
            next: spaces => {
              this.spaces.set(spaces);
              const resolved = (id !== null)
                ? spaces.find(s => s.id === id)
                : spaces.find(s => s.name === payload.name);
              resolved
                ? this.persistPendingPhoto(resolved, successMsg)
                : (this.isSaving.set(false), this.closeModal(), this.toast.showSuccess(successMsg));
            },
            error: () => {
              this.isSaving.set(false);
              this.closeModal();
              this.toast.showSuccess(successMsg);
            }
          });
        }
      },
      error: () => {
        this.isSaving.set(false);
        this.toast.showError(id !== null ? 'Unable to update the space.' : 'Unable to create the space.');
      }
    });
  }

  askDelete(id: number): void {
    this.pendingDeleteId.set(id);
  }

  confirmDelete(): void {
    const id = this.pendingDeleteId();
    if (id === null) return;

    this.spacesService.deleteSpace(id).subscribe({
      next: () => {
        this.spaces.update(list => list.filter(space => space.id !== id));
        this.pendingDeleteId.set(null);
        if (this.currentSpace()?.id === id) {
          this.closeModal();
        }
        this.toast.showSuccess('Space deleted.');
      },
      error: () => this.toast.showError('Unable to delete the space.'),
    });
  }

  cancelDelete(): void {
    this.pendingDeleteId.set(null);
  }

  loadSpaceDetail(id: number): void {
    this.isLoadingDetails.set(true);
    this.spacesService.getSpace(id).subscribe({
      next: space => {
        this.currentSpace.set(space);
        this.patchForm(space);
        this.isLoadingDetails.set(false);
      },
      error: () => {
        this.isLoadingDetails.set(false);
        this.toast.showError('Unable to load space details.');
      },
    });
  }

  onAmenityToggle(amenityId: number, checked: boolean): void {
    const current = [...((this.form.get('amenities')?.value as number[] | null) ?? [])];
    const next = checked
      ? Array.from(new Set([...current, amenityId]))
      : current.filter(id => id !== amenityId);

    this.form.patchValue({ amenities: next });
  }

  isAmenitySelected(amenityId: number): boolean {
    const selected = (this.form.get('amenities')?.value as number[] | null) ?? [];
    return selected.includes(amenityId);
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.clearSelectedPhoto();
    this.selectedPhotoFile.set(file);
    this.selectedPhotoName.set(file.name);
    this.selectedPhotoPreview.set(URL.createObjectURL(file));
  }

  removeSelectedPhoto(): void {
    this.clearSelectedPhoto();
  }

  deletePhoto(photo: SpacePhoto): void {
    const spaceId = this.currentSpace()?.id;
    if (!spaceId || this.isUploadingPhoto()) return;

    this.isUploadingPhoto.set(true);
    this.spacesService.deleteSpacePhoto(spaceId, photo.id).subscribe({
      next: () => {
        this.loadSpaces();
        this.loadSpaceDetail(spaceId);
        this.isUploadingPhoto.set(false);
        this.toast.showSuccess('Photo deleted.');
      },
      error: () => {
        this.isUploadingPhoto.set(false);
        this.toast.showError('Unable to delete the photo.');
      },
    });
  }

  primaryPhoto(space: Space | null): string | undefined {
    if (!space) return undefined;
    const primary = space.photos.find(photo => photo.is_primary);
    return primary?.url ?? space.photo;
  }

  readonly previewSpace = signal<Space | null>(null);
  readonly showPreview  = signal(false);

  openPreview(space: Space): void {
    this.previewSpace.set(space);
    this.showPreview.set(true);
  }

  closePreview(): void {
    this.showPreview.set(false);
    this.previewSpace.set(null);
  }

  previewPhotoUrl(space: Space): string {
    return this.primaryPhoto(space)
      ?? `https://picsum.photos/seed/${encodeURIComponent(space.name)}/800/600.jpg`;
  }

  private buildPayload(): SpaceWritePayload {
    const raw = this.form.getRawValue();

    return {
      name: String(raw.name ?? ''),
      space_type: raw.space_type,
      address: String(raw.address ?? ''),
      description: String(raw.description ?? ''),
      capacity: Number(raw.capacity ?? 0),
      price_per_hour: Number(raw.price_per_hour ?? 0),
      price_per_day: Number(raw.price_per_day ?? 0),
      is_available: !!raw.is_available,
      amenities: Array.isArray(raw.amenities) ? raw.amenities.map((value: number | string) => Number(value)) : [],
    };
  }

  private patchForm(space: Space): void {
    this.form.patchValue({
      name: space.name,
      space_type: space.space_type,
      address: space.address,
      description: space.description,
      capacity: space.capacity,
      price_per_hour: space.price_per_hour,
      price_per_day: space.price_per_day,
      is_available: space.is_available,
      amenities: space.amenities.map(amenity => amenity.id),
    });
  }

  private resetForm(): void {
    this.form.reset({
      name: '',
      space_type: 'desk',
      address: '',
      description: '',
      capacity: 1,
      price_per_hour: 0,
      price_per_day: 0,
      is_available: true,
      amenities: [],
    });
  }

  private persistPendingPhoto(space: Space, successMessage: string): void {
    this.mergeSpace(space);
    const file = this.selectedPhotoFile();

    if (!file) {
      this.isSaving.set(false);
      this.closeModal();
      this.toast.showSuccess(successMessage);
      return;
    }

    this.isUploadingPhoto.set(true);
    this.spacesService.uploadSpacePhoto(space.id, file, this.selectedPhotoIsPrimary()).subscribe({
      next: () => {
        this.isUploadingPhoto.set(false);
        this.isSaving.set(false);
        this.loadSpaces();
        this.closeModal();
        this.toast.showSuccess(successMessage);
      },
      error: () => {
        this.isUploadingPhoto.set(false);
        this.isSaving.set(false);
        this.loadSpaces();
        this.loadSpaceDetail(space.id);
        this.editingId.set(space.id);
        this.currentSpace.set(space);
        this.toast.showError('Space saved, but the photo upload failed.');
      },
    });
  }

  private mergeSpace(updated: Space): void {
    this.spaces.update(list => {
      const exists = list.some(space => space.id === updated.id);
      if (!exists) {
        return [updated, ...list];
      }

      return list.map(space => space.id === updated.id ? updated : space);
    });

    if (this.currentSpace()?.id === updated.id) {
      this.currentSpace.set(updated);
    }
  }

  private clearSelectedPhoto(): void {
    const preview = this.selectedPhotoPreview();
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    this.selectedPhotoFile.set(null);
    this.selectedPhotoPreview.set(null);
    this.selectedPhotoName.set('');
    this.selectedPhotoIsPrimary.set(false);
  }
}
