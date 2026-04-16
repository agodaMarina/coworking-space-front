import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  standalone: true,
  selector: 'app-home-page',
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomePageComponent implements OnInit, AfterViewInit {
  
  // =========================================
  // DONNÉES DE LA PAGE (Principe DRY)
  // =========================================

  features = [
    { title: 'Flexible Spaces', desc: "Whether you're a solopreneur, startup, or an established enterprise, our flexible office solutions cater to your evolving needs." },
    { title: 'Transparent Pricing', desc: "Choose a plan that suits your budget and business objectives, and experience the value of a premium coworking space without breaking the bank." },
    { title: 'Tailored Memberships', desc: "Whether you prefer the flexibility of a hot desk or the exclusivity of a private office, Cowork offers tailored solutions to suit every working style." }
  ];

  stats = [
    { target: 240, suffix: '%', label: 'Community Growth', color: 'bg-[#d9f99d]', delay: '0s' },
    { target: 99, suffix: '%', label: 'Technology Uptime', color: 'bg-[#bae6fd]', delay: '.1s' },
    { target: 50, suffix: '+', label: 'Happy Members', color: 'bg-[#fbcfe8]', delay: '.2s' },
    { target: 100, suffix: '%', label: 'Renewable Energy Sources', color: 'bg-[#fed7aa]', delay: '.3s' }
  ];

  // Séparé en deux pour gérer le design asymétrique (Masonry)
  testimonialsTop = [
    { name: 'Liam Brown', role: 'Software Engineer, TechStartup Innovations', quote: "The 24/7 access and secure facilities have been incredibly convenient for my team's flexible schedules. We love the coworking space!", img: 'face1', bg: 'bg-[#E2F89C]', isOffset: false },
    { name: 'Michael Rodriguez', role: 'Creative Director, DesignCraft Studio', quote: "The aesthetics of Cowork are inspiring. The attention to detail in the design creates an atmosphere that sparks creativity. It's a place where ideas flow effortlessly, and collaboration happens organically.", img: 'face2', bg: 'bg-[#F4F4F4]', isOffset: true },
    { name: 'Michael Thompson', role: 'Graphic Designer, DesignCo', quote: "As a freelance designer, I was getting tired of working from home or coffee shops. The coworking space has provided me with a productive and professional environment to focus on my work.", img: 'face3', bg: 'bg-[#BDE8F4]', isOffset: false }
  ];

  testimonialsBottom = [
    { name: 'David Wilson', role: 'Project Manager, SoftwareSolutions LLC', quote: "The coworking space has been a wonderful resource for my team. The open floor plan and dedicated private offices allow us to collaborate and concentrate as needed.", img: 'face4', bg: 'bg-[#FBCBE3]' },
    { name: 'Alex Nguyen', role: 'Marketing Consultant, Maverick Marketing', quote: "The flexible membership options and amenities like high-speed internet, printers, and meeting rooms have made this coworking space a perfect fit for my small business.", img: 'face5', bg: 'bg-[#FDD5AB]' }
  ];

  faqs = [
    { question: "How flexible are Cowork's membership plans?", answer: "Frequently asked questions ordered by popularity. Remember that if the visitor has not committed to the call to action, they may still have questions (doubts) that can be answered.", isOpen: true },
    { question: "What kind of events and networking opportunities does Cowork provide?", answer: "We host weekly networking events, guest speakers, and skill-sharing workshops for all members.", isOpen: false },
    { question: "Can I tour the Cowork space before committing to a membership?", answer: "Absolutely! You can book a free 30-minute guided tour through our website.", isOpen: false },
    { question: "Is Cowork suitable for remote teams and distributed workforces?", answer: "Yes, we offer enterprise plans tailored for distributed teams with private access options.", isOpen: false },
    { question: "What measures does Cowork take for environmental sustainability?", answer: "We use 100% renewable energy and enforce a strict zero-single-use-plastic policy.", isOpen: false },
    { question: "Still has questions?", answer: "Contact our support team directly via email or our live chat widget.", isOpen: false }
  ];

  blogs = [
    { badge: 'Trending', badgeColor: 'bg-[#AEE9F4]', time: '7 min read', title: 'Navigating the Future: Trends in Modern Coworking Spaces', img: 'blog-new-1', delay: '0s' },
    { badge: 'Productivity', badgeColor: 'bg-[#F8C8E1]', time: '5 min read', title: "Mastering Productivity: Tips from Cowork's High Achievers", img: 'blog-new-2', delay: '.1s' },
    { badge: 'Talk', badgeColor: 'bg-[#CEF09D]', time: '10 min read', title: "Tech Talk: The Backbone of Cowork's Seamless Experience", img: 'blog-new-3', delay: '.2s' }
  ];

  // =========================================
  // LOGIQUE ANGULAR
  // =========================================

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.setupRevealAnimation();
    this.setupStatCounter();
    this.setupNewsletterSubscribe();
  }

  // Gestion de l'ouverture/fermeture des FAQ (Remplace l'ancien addEventListener)
  toggleFaq(index: number): void {
    this.faqs.forEach((faq, i) => {
      faq.isOpen = i === index ? !faq.isOpen : false;
    });
  }

  // Animations d'apparition (Intersection Observer)
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

  // Animation des compteurs statistiques
  private setupStatCounter(): void {
    const statElements = document.querySelectorAll('.stat-num');
    let statsCounted = false;

    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !statsCounted) {
          statsCounted = true;
          statElements.forEach(el => {
            const htmlEl = el as HTMLElement;
            const target = parseInt(htmlEl.dataset['target'] || '0');
            const suffix = htmlEl.dataset['suffix'] || '';
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;

            const timer = setInterval(() => {
              current += step;
              if (current >= target) {
                current = target;
                clearInterval(timer);
              }
              htmlEl.textContent = Math.floor(current) + suffix;
            }, 16);
          });
        }
      });
    }, { threshold: 0.3 });

    statElements.forEach(el => statObserver.observe(el));
  }

  // Gestion de la Newsletter (Si celle-ci n'a pas été déplacée dans l'app-footer)
  private setupNewsletterSubscribe(): void {
    const subscribeBtn = document.querySelector('footer button');
    if (!subscribeBtn) return;

    subscribeBtn.addEventListener('click', function(this: HTMLElement, e: Event) {
      e.preventDefault(); // Empêcher le rechargement de la page
      const input = this.previousElementSibling?.querySelector('input') as HTMLInputElement;
      if (!input) return;

      if (input.value && input.value.includes('@')) {
        const original = this.textContent;
        this.textContent = 'Subscribed!';
        this.classList.remove('text-black');
        this.classList.add('bg-emerald-600', 'text-white');
        input.value = '';

        setTimeout(() => {
          this.textContent = original;
          this.classList.remove('bg-emerald-600', 'text-white');
          this.classList.add('text-black');
        }, 2500);
      } else {
        const inputParent = input.parentElement;
        if(inputParent) inputParent.style.borderColor = 'rgba(239,68,68,0.5)';
        input.placeholder = 'Enter a valid email';

        setTimeout(() => {
          if(inputParent) inputParent.style.borderColor = '';
          input.placeholder = 'Enter your email';
        }, 2000);
      }
    });
  }
}