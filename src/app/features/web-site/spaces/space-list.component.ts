import { NgClass } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Space, SpacesService } from '../../../core/services/spaces.service';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
    standalone: true,
    selector: 'app-space-list-page',
    imports: [
        NgClass,
        HeaderComponent,
        FooterComponent,
        ProgressSpinnerModule,
    ],
    templateUrl: './space-list.component.html',
    styleUrl: './space-list.component.css',
})
export class SpaceListPageComponent implements OnInit {
    spaces = signal<Space[]>([]);

    selectedType = signal<string | null>(null);
    selectedCapacityMin = signal<number>(0);

    typeOptions = [
        { label: 'Hot Desk', value: 'desk' },
        { label: 'Open Space', value: 'open_space' },
        { label: 'Meeting Room', value: 'meeting_room' },
        { label: 'Private Office', value: 'private' },
        { label: 'Conference Room', value: 'conference' },
    ];

    private readonly typeBadgeColors: Record<string, string> = {
        desk:         'bg-[#CEF09D]',
        open_space:   'bg-[#AEE9F4]',
        meeting_room: 'bg-[#F8C8E1]',
        private:      'bg-[#FDD5AB]',
        conference:   'bg-[#E2F89C]',
    };

    getTypeBadgeColor(type: string): string {
        return this.typeBadgeColors[type] ?? 'bg-zinc-100';
    }

    capacityOptions = [
        { label: 'Any', value: 0 },
        { label: '5+', value: 5 },
        { label: '10+', value: 10 },
        { label: '20+', value: 20 },
        { label: '50+', value: 50 },
    ];

    filteredSpaces = computed(() => {
        const type = this.selectedType();
        const minCap = this.selectedCapacityMin();

        return this.spaces().filter(space => {
            const typeMatch = !type || space.space_type === type;
            const capacityMatch = space.capacity >= minCap;
            return typeMatch && capacityMatch;
        });
    });

    constructor(public spacesService: SpacesService, private router: Router) {}

    ngOnInit() {
        this.loadSpaces();
    }

    loadSpaces() {
        this.spacesService.getSpaces().subscribe({
            next: (spaces) => this.spaces.set(spaces),
            error: (error) => console.error('Error loading spaces:', error)
        });
    }

    selectType(value: string | null) {
        this.selectedType.set(value);
    }

    selectCapacity(value: number) {
        this.selectedCapacityMin.set(value);
    }

    resetFilters() {
        this.selectedType.set(null);
        this.selectedCapacityMin.set(0);
    }

    openDetail(space: Space) {
        this.router.navigate(['/spaces', space.id]);
    }

    goToBooking(space: Space) {
        this.router.navigate(['/booking'], { queryParams: { spaceId: space.id } });
    }

    // Utility to build seeded picsum URLs safely (encodes names)
    getImageUrl(seed: string, w: number = 600, h: number = 450): string {
        try {
            return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}.jpg`;
        } catch (e) {
            return `https://picsum.photos/${w}/${h}`;
        }
    }
}