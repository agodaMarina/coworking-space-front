import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { RouterLink } from "@angular/router";
import { MessageService } from 'primeng/api';

@Component({
  standalone: true,
  selector: 'app-home-page',
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    RouterLink
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  providers:[MessageService]
})
export class HomePageComponent implements OnInit, AfterViewInit {

  // =========================================
  // DONNÉES DE LA PAGE (Principe DRY)
  // =========================================

  features = [
    { title: 'Réservez facilement', desc: "Réservez votre salle de cours en quelques clics, depuis n'importe quel appareil. Choisissez votre créneau horaire et confirmez instantanément." },
    { title: 'Vérifiez la disponibilité', desc: "Consultez en temps réel les créneaux disponibles pour toutes les salles du campus. Filtrez par capacité, équipements et horaires selon vos besoins." },
    { title: 'Gérez vos créneaux', desc: "Suivez et annulez vos réservations directement depuis votre tableau de bord. Les modifications sont prises en compte instantanément." }
  ];

  stats = [
    { target: 80, suffix: '', label: 'Salles disponibles', color: '#d9f99d', delay: '0s' },
    { target: 99, suffix: '%', label: 'Disponibilité du service', color: '#bae6fd', delay: '.1s' },
    { target: 200, suffix: '+', label: 'Enseignants inscrits', color: '#fbcfe8', delay: '.2s' },
    { target: 24, suffix: 'h', label: 'Accès aux réservations', color: '#fed7aa', delay: '.3s' }
  ];

  // Séparé en deux pour gérer le design asymétrique (Masonry)
  testimonialsTop = [
    { name: 'Prof. Claire Martin', role: 'Maître de conférences, Département Informatique', quote: "Je réserve mes salles de TD en quelques secondes. Le système est fiable même le lundi matin où la concurrence est forte !", img: 'face1', bg: 'bg-[#E2F89C]', isOffset: false },
    { name: 'Prof. Jean Dupont', role: 'Directeur pédagogique, Faculté des Sciences', quote: "La gestion des équipements par salle est très pratique. Je sais exactement dans quelle salle se trouve le vidéoprojecteur dont j'ai besoin pour mon cours magistral.", img: 'face2', bg: 'bg-[#F4F4F4]', isOffset: true },
    { name: 'Prof. Amina Benali', role: 'Enseignante-chercheuse, Département Mathématiques', quote: "L'annulation est simple et rapide. Je peux libérer un créneau si mon cours est déplacé, et mes collègues peuvent immédiatement le réserver.", img: 'face3', bg: 'bg-[#BDE8F4]', isOffset: false }
  ];

  testimonialsBottom = [
    { name: 'Prof. Thomas Leroy', role: 'Chargé de cours, Faculté de Droit', quote: "Le système évite les conflits de salles qui étaient fréquents auparavant. Plus de mauvaises surprises en arrivant devant une salle déjà occupée !", img: 'face4', bg: 'bg-[#FBCBE3]' },
    { name: 'Prof. Sophie Girard', role: 'Responsable TP, Département Physique', quote: "La recherche par capacité est essentielle pour mes travaux pratiques. Je trouve rapidement les salles pouvant accueillir mes 30 étudiants avec le bon équipement.", img: 'face5', bg: 'bg-[#FDD5AB]' }
  ];

  faqs = [
    { question: "Comment réserver une salle de cours ?", answer: "Connectez-vous avec votre compte enseignant, accédez à la section 'Salles disponibles', choisissez votre créneau horaire et confirmez la réservation. La confirmation est immédiate.", isOpen: true },
    { question: "Puis-je annuler une réservation ?", answer: "Oui, les annulations sont possibles jusqu'à 2 heures avant le début du créneau. Passé ce délai, la réservation ne peut plus être annulée pour permettre aux autres enseignants de planifier.", isOpen: false },
    { question: "Que faire si une salle est déjà réservée sur mon créneau ?", answer: "Le système affiche uniquement les salles disponibles pour le créneau que vous sélectionnez. Si aucune salle de la capacité souhaitée n'est disponible, essayez un créneau adjacent.", isOpen: false },
    { question: "Comment filtrer les salles par équipement ?", answer: "Utilisez les filtres de recherche pour sélectionner les équipements nécessaires (projecteur, tableau blanc interactif, laboratoire informatique, etc.). Seules les salles équipées s'afficheront.", isOpen: false },
    { question: "Qui peut créer un compte sur la plateforme ?", answer: "La plateforme est réservée aux enseignants et personnels du campus. Les inscriptions sont vérifiées par les administrateurs. Contactez le service informatique pour tout accès.", isOpen: false },
    { question: "Encore des questions ?", answer: "Contactez le service de gestion des salles par email ou en personne à l'accueil de l'administration centrale.", isOpen: false }
  ];

  blogs = [
    { badge: 'Actualité', badgeColor: 'bg-[#AEE9F4]', time: '5 min', title: 'Comment optimiser l\'occupation des salles pendant le pic du lundi matin', img: '/images/desktop.png', delay: '0s', link:'' },
    { badge: 'Conseils', badgeColor: 'bg-[#F8C8E1]', time: '4 min', title: "Bien planifier ses cours : guide de réservation pour les enseignants", img: '/images/image-desktop.png', delay: '.1s',link:'' },
    { badge: 'Technique', badgeColor: 'bg-[#CEF09D]', time: '6 min', title: "Verrouillage et réservations simultanées : comment le système garantit l'intégrité", img: '/images/view-modern-office.jpg', delay: '.2s',link:'' }
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
