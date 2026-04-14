import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Select } from 'primeng/select';
import { Slider } from 'primeng/slider';
import { TableModule } from 'primeng/table';
import { Space, SpacesService } from '../../core/services/spaces.service';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../shared/components/header/header.component';

interface Amenity {
    id: number;
    name: string;
    icon: string;
}

@Component({
    standalone: true,
    selector: 'app-space-list-page',
    imports: [
        CommonModule,
        FormsModule,
        HeaderComponent,
        FooterComponent,
        Button,
        TableModule,
        Dialog,
        Select,
        Slider,
        ProgressSpinnerModule,
    ],
    templateUrl: './space-list.component.html',
    styleUrl: './space-list.component.css',
})
export class SpaceListPageComponent implements OnInit {
    // State signals
    spaces = signal<Space[]>([]);
    selectedSpace = signal<Space | null>(null);
    showDetailModal = signal(false);
    selectedType = signal<string | null>(null);
    capacityRange = signal<[number, number]>([0, 100]);
    capacityRangeMin = 0;
    capacityRangeMax = 100;

    // Filter options
    typeOptions = [
        { label: 'Desk', value: 'desk' },
        { label: 'Open Space', value: 'open_space' },
        { label: 'Meeting Room', value: 'meeting_room' },
        { label: 'Private Office', value: 'private' },
        { label: 'Conference Room', value: 'conference' },
    ];

    // Computed filtered spaces
    filteredSpaces = computed(() => {
        const type = this.selectedType();
        const [minCap, maxCap] = this.capacityRange();

        return this.spaces().filter(space => {
            const typeMatch = !type || space.space_type === type;
            const capacityMatch = space.capacity >= minCap && space.capacity <= maxCap;
            return typeMatch && capacityMatch;
        });
    });

    constructor(public spacesService: SpacesService) { }

    ngOnInit() {
        this.loadSpaces();
    }

    loadSpaces() {
        this.spacesService.getSpaces().subscribe({
            next: (spaces) => this.spaces.set(spaces),
            error: (error) => console.error('Error loading spaces:', error)
        });
    }

    openDetail(space: Space) {
        this.selectedSpace.set(space);
        this.showDetailModal.set(true);
    }

    closeDetail() {
        this.showDetailModal.set(false);
        this.selectedSpace.set(null);
    }

    updateCapacityRange() {
        this.capacityRange.set([this.capacityRangeMin, this.capacityRangeMax]);
    }

    resetFilters() {
        this.selectedType.set(null);
        this.capacityRange.set([0, 100]);
        this.capacityRangeMin = 0;
        this.capacityRangeMax = 100;
    }

    goToBooking(space: Space) {
        console.log('Navigate to booking for space:', space.name);
    }
}
