import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CarouselModule } from 'primeng/carousel';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  standalone: true,
  selector: 'app-home-page',
  imports: [
    CommonModule,
    RouterLink,
    HeaderComponent,
    FooterComponent,
    ButtonModule,
    CardModule,
    CarouselModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomePageComponent {
  galleryImages = [
    { title: 'Modern Office Spaces', description: 'Bright and spacious offices designed for collaboration' },
    { title: 'Meeting Rooms', description: 'Well-equipped meeting rooms for brainstorming sessions' },
    { title: 'Collaborative Zones', description: 'Open spaces perfect for team projects and networking' },
    { title: 'Quiet Focus Areas', description: 'Dedicated zones for concentrated work' },
  ];
}
