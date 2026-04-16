import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
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
    HeaderComponent,
    FooterComponent,
    ButtonModule,
    CardModule,
    CarouselModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomePageComponent implements OnInit, AfterViewInit {
  galleryImages = [
    { title: 'Modern Office Spaces', description: 'Bright and spacious offices designed for collaboration' },
    { title: 'Meeting Rooms', description: 'Well-equipped meeting rooms for brainstorming sessions' },
    { title: 'Collaborative Zones', description: 'Open spaces perfect for team projects and networking' },
    { title: 'Quiet Focus Areas', description: 'Dedicated zones for concentrated work' },
  ];

  ngOnInit(): void {
    this.setupNavScrollListener();
  }

  ngAfterViewInit(): void {
    this.setupRevealAnimation();
    this.setupStatCounter();
    this.setupFAQAccordion();
    this.setupNewsletterSubscribe();
  }

  /**
   * Setup scroll reveal animation - adds 'visible' class to elements when they enter viewport
   */
  private setupRevealAnimation(): void {
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  /**
   * Setup animated stat counter - counts from 0 to target number
   */
  private setupStatCounter(): void {
    const statElements = document.querySelectorAll('.stat-num');
    let statsCounted = false;

    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !statsCounted) {
          statsCounted = true;
          statElements.forEach(el => {
            const target = parseInt((el as HTMLElement).dataset['target'] || '0');
            const suffix = (el as HTMLElement).dataset['suffix'] || '';
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;

            const timer = setInterval(() => {
              current += step;
              if (current >= target) {
                current = target;
                clearInterval(timer);
              }
              el.textContent = Math.floor(current) + suffix;
            }, 16);
          });
        }
      });
    }, { threshold: 0.3 });

    statElements.forEach(el => statObserver.observe(el));
  }

  /**
   * Setup FAQ accordion - toggle open/close on click
   */
  private setupFAQAccordion(): void {
    document.querySelectorAll('.faq-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.parentElement;
        if (!item) return;

        const answer = item.querySelector('.faq-ans');
        const icon = btn.querySelector('.faq-icon');

        if (!answer || !icon) return;

        const isOpen = answer.classList.contains('open');

        // Close all FAQs
        document.querySelectorAll('.faq-ans').forEach(a => a.classList.remove('open'));
        document.querySelectorAll('.faq-icon').forEach(i => {
          (i as any).setAttribute('data-icon', 'mdi:plus');
          (i as HTMLElement).style.transform = 'rotate(0deg)';
        });

        // Open clicked FAQ if it was closed
        if (!isOpen) {
          answer.classList.add('open');
          (icon as any).setAttribute('data-icon', 'mdi:minus');
          (icon as HTMLElement).style.transform = 'rotate(180deg)';
        }
      });
    });
  }

  /**
   * Setup newsletter subscribe feedback
   */
  private setupNewsletterSubscribe(): void {
    const subscribeBtn = document.querySelector('footer button');
    if (!subscribeBtn) return;

    subscribeBtn.addEventListener('click', function(this: HTMLElement) {
      const input = this.previousElementSibling as HTMLInputElement;
      if (!input) return;

      if (input.value && input.value.includes('@')) {
        const original = this.textContent;
        this.textContent = 'Subscribed!';
        this.classList.remove('bg-brand-green');
        this.classList.add('bg-emerald-600');
        input.value = '';

        setTimeout(() => {
          this.textContent = original;
          this.classList.remove('bg-emerald-600');
          this.classList.add('bg-brand-green');
        }, 2500);
      } else {
        input.style.borderColor = 'rgba(239,68,68,0.5)';
        input.placeholder = 'Enter a valid email';

        setTimeout(() => {
          input.style.borderColor = '';
          input.placeholder = 'your@email.com';
        }, 2000);
      }
    });
  }

  /**
   * Setup nav background on scroll
   */
  private setupNavScrollListener(): void {
    const nav = document.querySelector('nav');
    if (!nav) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        nav.classList.add('border-white/10');
        nav.classList.remove('border-white/5');
        (nav as HTMLElement).style.backgroundColor = 'rgba(0,0,0,0.8)';
      } else {
        nav.classList.remove('border-white/10');
        nav.classList.add('border-white/5');
        (nav as HTMLElement).style.backgroundColor = 'rgba(0,0,0,0.6)';
      }
    });
  }
}
