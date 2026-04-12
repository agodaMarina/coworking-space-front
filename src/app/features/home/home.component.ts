import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
  template: `
    <div class="page-shell">
      <app-header></app-header>

      <!-- HERO SECTION -->
      <section class="hero-section">
        <div class="hero-container">
          <div class="hero-content">
            <p class="hero-eyebrow">Réservez un espace de coworking ou une salle de réunion</p>
            <h1 class="hero-title">Elevate Your Workspace with Cowork</h1>
            <p class="hero-description">
              Découvrez des espaces flexibles, des salles équipées et des services pensés pour vos équipes.
            </p>
            <div class="hero-actions">
              <button pButton type="button" label="Voir les espaces" icon="pi pi-arrow-right"
                      class="p-button-raised p-button-primary" routerLink="/spaces"></button>
              <button pButton type="button" label="Faire une réservation" icon="pi pi-calendar"
                      class="p-button-raised p-button-outlined" routerLink="/booking"></button>
            </div>
          </div>
          <div class="hero-visual">
            <div class="hero-image-placeholder">
              <p>Espace moderne, Wi-Fi, café inclus.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- LOGO CLOUD -->
      <section class="logo-cloud-section">
        <div class="logo-cloud-container">
          <div class="logo-item"><span class="logo-text">🏢 Enterprise</span></div>
          <div class="logo-item"><span class="logo-text">🚀 Startups</span></div>
          <div class="logo-item"><span class="logo-text">👥 Freelancers</span></div>
          <div class="logo-item"><span class="logo-text">🎯 Teams</span></div>
          <div class="logo-item"><span class="logo-text">🌍 Global</span></div>
        </div>
      </section>

      <!-- WHY CHOOSE COWORK -->
      <section class="why-choose-section">
        <h2 class="section-title">Why Choose <span class="highlight">Cowork?</span></h2>
        <div class="benefits-grid">
          <p-card class="benefit-card">
            <template pTemplate="header">
              <div class="benefit-icon">🏠</div>
            </template>
            <h3>Flexible Spaces</h3>
            <p>Choose from desks, private offices, or meeting rooms that fit your needs.</p>
          </p-card>
          <p-card class="benefit-card">
            <template pTemplate="header">
              <div class="benefit-icon">💰</div>
            </template>
            <h3>Transparent Pricing</h3>
            <p>No hidden fees. Clear, competitive pricing for all space types.</p>
          </p-card>
          <p-card class="benefit-card">
            <template pTemplate="header">
              <div class="benefit-icon">🤝</div>
            </template>
            <h3>Talented Community</h3>
            <p>Network with professionals and grow your business in our community.</p>
          </p-card>
        </div>
      </section>

      <!-- GALLERY / CAROUSEL -->
      <section class="gallery-section">
        <h2 class="section-title">Explore Cowork Through Our <span class="highlight">Lens</span></h2>
        <p class="section-subtitle">
          Visualize your workspace with our curated collection of office environments.
        </p>
        <div class="carousel-wrapper">
          <p-carousel [value]="galleryImages" [numVisible]="1" [circular]="true" [autoplayInterval]="5000">
            <ng-template pTemplate="item" let-item>
              <div class="gallery-item">
                <div class="gallery-image-placeholder">
                  <p>{{ item.title }}</p>
                </div>
                <p class="gallery-caption">{{ item.description }}</p>
              </div>
            </ng-template>
          </p-carousel>
        </div>
      </section>

      <!-- STATS -->
      <section class="stats-section">
        <h2 class="section-title">Transformative Statistics That Speak Volumes</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">240%</div>
            <p class="stat-label">Productivity Increase</p>
          </div>
          <div class="stat-card">
            <div class="stat-number">99%</div>
            <p class="stat-label">Client Satisfaction</p>
          </div>
          <div class="stat-card">
            <div class="stat-number">50+</div>
            <p class="stat-label">Locations Worldwide</p>
          </div>
          <div class="stat-card">
            <div class="stat-number">100%</div>
            <p class="stat-label">Uptime Guarantee</p>
          </div>
        </div>
      </section>

      <!-- TESTIMONIALS -->
      <section class="testimonials-section">
        <h2 class="section-title">Hear it from Our Clients</h2>
        <div class="testimonials-grid">
          <div class="testimonial-card bg-green">
            <p>"Cowork transformed how our team collaborates. The spaces are modern and the community is incredible."</p>
            <p class="author">— Sarah Johnson, Founder</p>
          </div>
          <div class="testimonial-card bg-gray">
            <p>"Flexible, professional, and affordable. Exactly what we needed for our growing startup."</p>
            <p class="author">— Marc Chen, CEO</p>
          </div>
          <div class="testimonial-card bg-blue">
            <p>"The networking opportunities alone are worth it. I've collaborated with amazing professionals."</p>
            <p class="author">— Emma Wilson, Consultant</p>
          </div>
          <div class="testimonial-card bg-pink">
            <p>"Best workspace experience. Clean, equipped, and the people are friendly and professional."</p>
            <p class="author">— David Brown, Developer</p>
          </div>
          <div class="testimonial-card bg-orange">
            <p>"Affordable luxury. Premium amenities without the premium price tag. Highly recommended!"</p>
            <p class="author">— Lisa Anderson, Designer</p>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section class="faq-section">
        <h2 class="section-title">Your Roadmap to Cowork Clarity</h2>
        <div class="faq-container">
          <div class="faq-item">
            <h3>What types of spaces do you offer?</h3>
            <p>We offer dedicated desks, private offices, meeting rooms, and conference spaces tailored to your needs.</p>
          </div>
          <div class="faq-item">
            <h3>How flexible are the booking terms?</h3>
            <p>Very flexible! Choose from hourly, daily, weekly, or monthly plans. Cancel or modify anytime.</p>
          </div>
          <div class="faq-item">
            <h3>What's included in the pricing?</h3>
            <p>All spaces include Wi-Fi, utilities, furniture, and access to common areas with complimentary coffee.</p>
          </div>
          <div class="faq-item">
            <h3>Do you offer membership discounts?</h3>
            <p>Yes! Monthly memberships get automatic discounts and priority access to new spaces.</p>
          </div>
          <div class="faq-item">
            <h3>How do I manage my bookings?</h3>
            <p>Use our intuitive dashboard to view, modify, and cancel bookings anytime.</p>
          </div>
        </div>
      </section>

      <!-- BLOG -->
      <section class="blog-section">
        <h2 class="section-title">Insights, Innovation, and <span class="highlight">Inspiration</span></h2>
        <div class="blog-grid">
          <div class="blog-card">
            <div class="blog-image">📊</div>
            <h3>Emerging Remote Work Trends in 2025</h3>
            <p>Strategic insights on the future of workspace</p>
          </div>
          <div class="blog-card">
            <div class="blog-image">📱</div>
            <h3>Maximizing Productivity: Tips from Cowork Members</h3>
            <p>Expert advice to boost your workflow</p>
          </div>
          <div class="blog-card">
            <div class="blog-image">🚀</div>
            <h3>Tech Stack: The Backbone of Modern Workspaces</h3>
            <p>How technology powers productive collaboration</p>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="cta-section">
        <h2>Seize 🎨 The Moment – Join Cowork Today!</h2>
        <p>Find your perfect workspace and start collaborating with like-minded professionals.</p>
        <button pButton type="button" label="Get Started Now" icon="pi pi-check" class="p-button-primary p-button-lg"></button>
      </section>

      <app-footer></app-footer>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep {
        .page-shell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .hero-section {
          background: radial-gradient(circle at top left, rgba(37, 99, 235, 0.12), transparent 40%);
          padding: 4rem 1.5rem;
        }

        .hero-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: center;
        }

        @media (max-width: 768px) {
          .hero-container {
            grid-template-columns: 1fr;
          }
        }

        .hero-title {
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          margin: 1rem 0;
          color: #0f172a;
          line-height: 1.2;
        }

        .hero-eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #2563eb;
          font-weight: 700;
          margin: 0 0 1rem;
          font-size: 0.875rem;
        }

        .hero-description {
          color: #475569;
          font-size: 1.125rem;
          line-height: 1.75;
          margin: 1rem 0;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          flex-wrap: wrap;
        }

        .hero-image-placeholder {
          width: 100%;
          min-height: 350px;
          border-radius: 1.5rem;
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.15), #eff6ff);
          display: grid;
          place-items: center;
          text-align: center;
          padding: 2rem;
          font-weight: 600;
          color: #0f172a;
        }

        /* LOGO CLOUD */
        .logo-cloud-section {
          padding: 3rem 1.5rem;
          background: #f8fafc;
        }

        .logo-cloud-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 2rem;
        }

        .logo-item {
          padding: 1.5rem;
          background: white;
          border-radius: 0.75rem;
          border: 1px solid rgba(148, 163, 184, 0.1);
          text-align: center;
        }

        .logo-text {
          font-weight: 600;
          color: #0f172a;
        }

        /* SECTIONS */
        .why-choose-section,
        .stats-section,
        .faq-section {
          padding: 4rem 1.5rem;
        }

        .gallery-section,
        .testimonials-section,
        .blog-section {
          padding: 4rem 1.5rem;
          background: #f8fafc;
        }

        .section-title {
          text-align: center;
          font-size: clamp(2rem, 4vw, 2.5rem);
          margin-bottom: 3rem;
          color: #0f172a;
          font-weight: 700;
        }

        .highlight {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .benefits-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .benefit-card p {
          color: #475569;
          line-height: 1.6;
        }

        /* CAROUSEL */
        .carousel-wrapper {
          max-width: 1000px;
          margin: 0 auto;
        }

        .section-subtitle {
          text-align: center;
          color: #475569;
          margin: 0 auto 2rem;
          max-width: 600px;
        }

        .gallery-image-placeholder {
          width: 100%;
          height: 400px;
          border-radius: 1.5rem;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          display: grid;
          place-items: center;
          color: white;
          font-weight: 600;
          font-size: 1.5rem;
        }

        .gallery-caption {
          margin-top: 1.5rem;
          text-align: center;
          color: #0f172a;
          font-weight: 600;
        }

        /* STATS */
        .stats-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .stat-card {
          padding: 2rem;
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(37, 99, 235, 0.05));
          border-radius: 1.5rem;
          border: 1px solid rgba(37, 99, 235, 0.2);
          text-align: center;
        }

        .stat-number {
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          font-weight: 700;
          color: #2563eb;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: #475569;
          font-weight: 600;
          margin: 0;
        }

        /* TESTIMONIALS */
        .testimonials-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .testimonial-card {
          padding: 1.5rem;
          border-radius: 1rem;
          min-height: 200px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          font-style: italic;
          line-height: 1.6;
        }

        .testimonial-card.bg-green {
          background: #d1fae5;
          color: #065f46;
        }

        .testimonial-card.bg-gray {
          background: #e5e7eb;
          color: #374151;
        }

        .testimonial-card.bg-blue {
          background: #dbeafe;
          color: #1e40af;
        }

        .testimonial-card.bg-pink {
          background: #fbcfe8;
          color: #be185d;
        }

        .testimonial-card.bg-orange {
          background: #fed7aa;
          color: #b45309;
        }

        .testimonial-card .author {
          font-style: normal;
          font-weight: 600;
          font-size: 0.95rem;
          margin: 0;
        }

        /* FAQ */
        .faq-container {
          max-width: 800px;
          margin: 0 auto;
        }

        /* BLOG */
        .blog-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .blog-card {
          background: white;
          border-radius: 1rem;
          padding: 1.5rem;
          border: 1px solid rgba(148, 163, 184, 0.1);
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .blog-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .blog-image {
          font-size: 3rem;
          text-align: center;
          margin-bottom: 1rem;
        }

        .blog-card h3 {
          color: #0f172a;
          font-weight: 600;
          margin: 1rem 0 0.5rem;
        }

        .blog-card p {
          color: #64748b;
          font-size: 0.875rem;
          margin: 0;
        }

        /* CTA */
        .cta-section {
          padding: 4rem 1.5rem;
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(16, 185, 129, 0.1));
          text-align: center;
        }

        .cta-section h2 {
          font-size: clamp(2rem, 4vw, 2.75rem);
          margin-bottom: 1rem;
          color: #0f172a;
        }

        .cta-section p {
          font-size: 1.125rem;
          color: #475569;
          margin: 0 auto 2rem;
          max-width: 600px;
        }
      }
    `,
  ],
})
export class HomePageComponent {
  galleryImages = [
    { title: 'Modern Office Spaces', description: 'Bright and spacious offices designed for collaboration' },
    { title: 'Meeting Rooms', description: 'Well-equipped meeting rooms for brainstorming sessions' },
    { title: 'Collaborative Zones', description: 'Open spaces perfect for team projects and networking' },
    { title: 'Quiet Focus Areas', description: 'Dedicated zones for concentrated work' },
  ];
}

// @Component({
//   standalone: true,
//   selector: 'app-home-page',
//   imports: [
//     CommonModule,
//     RouterLink,
//     NgOptimizedImage,
//     HeaderComponent,
//     FooterComponent,
//     ButtonModule,
//     CardModule,
//     CarouselModule,
//     AccordionModule,
//   ],
//   template: `
//     <div class="page-shell">
//       <app-header></app-header>

//       <!-- HERO SECTION -->
//       <section class="hero-section">
//         <div class="hero-container">
//           <div class="hero-content">
//             <p class="hero-eyebrow">Réservez un espace de coworking ou une salle de réunion</p>
//             <h1 class="hero-title">Elevate Your Workspace with Cowork</h1>
//             <p class="hero-description">
//               Découvrez des espaces flexibles, des salles équipées et des services pensés pour vos équipes.
//             </p>
//             <div class="hero-actions">
//               <button pButton type="button" label="Voir les espaces" icon="pi pi-arrow-right"
//                       class="p-button-raised p-button-primary" routerLink="/spaces"></button>
//               <button pButton type="button" label="Faire une réservation" icon="pi pi-calendar"
//                       class="p-button-raised p-button-outlined" routerLink="/booking"></button>
//             </div>
//           </div>
//           <div class="hero-visual">
//             <div class="hero-image-placeholder">
//               <p>Espace moderne, Wi-Fi, café inclus.</p>
//             </div>
//           </div>
//         </div>
//       </section>

//       <!-- LOGO CLOUD -->
//       <section class="logo-cloud-section">
//         <div class="logo-cloud-container">
//           <div class="logo-item">
//             <span class="logo-text">🏢 Enterprise</span>
//           </div>
//           <div class="logo-item">
//             <span class="logo-text">🚀 Startups</span>
//           </div>
//           <div class="logo-item">
//             <span class="logo-text">👥 Freelancers</span>
//           </div>
//           <div class="logo-item">
//             <span class="logo-text">🎯 Teams</span>
//           </div>
//           <div class="logo-item">
//             <span class="logo-text">🌍 Global</span>
//           </div>
//         </div>
//       </section>

//       <!-- WHY CHOOSE COWORK -->
//       <section class="why-choose-section">
//         <h2 class="section-title">Why Choose <span class="highlight">Cowork?</span></h2>
//         <div class="benefits-grid">
//           <p-card class="benefit-card">
//             <template pTemplate="header">
//               <div class="benefit-icon">🏠</div>
//             </template>
//             <h3>Flexible Spaces</h3>
//             <p class="benefit-description">
//               Choose from desks, private offices, or meeting rooms that fit your needs.
//             </p>
//           </p-card>

//           <p-card class="benefit-card">
//             <template pTemplate="header">
//               <div class="benefit-icon">💰</div>
//             </template>
//             <h3>Transparent Pricing</h3>
//             <p class="benefit-description">
//               No hidden fees. Clear, competitive pricing for all space types.
//             </p>
//           </p-card>

//           <p-card class="benefit-card">
//             <template pTemplate="header">
//               <div class="benefit-icon">🤝</div>
//             </template>
//             <h3>Talented Community</h3>
//             <p class="benefit-description">
//               Network with professionals and grow your business in our community.
//             </p>
//           </p-card>
//         </div>
//       </section>

//       <!-- GALLERY / CAROUSEL -->
//       <section class="gallery-section">
//         <h2 class="section-title">Explore Cowork Through Our <span class="highlight">Lens</span></h2>
//         <p class="section-subtitle">
//           Visualize your workspace with our curated collection of office environments.
//         </p>
//         <div class="carousel-wrapper">
//           <p-carousel [value]="galleryImages" [numVisible]="1" [circular]="true" [autoplayInterval]="5000">
//             <ng-template pTemplate="item" let-item>
//               <div class="gallery-item">
//                 <div class="gallery-image-placeholder">
//                   <p>{{ item.title }}</p>
//                 </div>
//                 <p class="gallery-caption">{{ item.description }}</p>
//               </div>
//             </ng-template>
//           </p-carousel>
//         </div>
//       </section>

//       <!-- TRANSFORMATIVE STATISTICS -->
//       <section class="stats-section">
//         <h2 class="section-title">Transformative Statistics That Speak Volumes</h2>
//         <div class="stats-grid">
//           <div class="stat-card">
//             <div class="stat-number">240%</div>
//             <p class="stat-label">Productivity Increase</p>
//           </div>
//           <div class="stat-card">
//             <div class="stat-number">99%</div>
//             <p class="stat-label">Client Satisfaction</p>
//           </div>
//           <div class="stat-card">
//             <div class="stat-number">50+</div>
//             <p class="stat-label">Locations Worldwide</p>
//           </div>
//           <div class="stat-card">
//             <div class="stat-number">100%</div>
//             <p class="stat-label">Uptime Guarantee</p>
//           </div>
//         </div>
//       </section>

//       <!-- TESTIMONIALS -->
//       <section class="testimonials-section">
//         <h2 class="section-title">Hear it from Our Clients</h2>
//         <div class="testimonials-grid">
//           <div class="testimonial-card bg-green">
//             <p class="testimonial-text">
//               "Cowork transformed how our team collaborates. The spaces are modern and the community is incredible."
//             </p>
//             <p class="testimonial-author">— Sarah Johnson, Founder</p>
//           </div>

//           <div class="testimonial-card bg-gray">
//             <p class="testimonial-text">
//               "Flexible, professional, and affordable. Exactly what we needed for our growing startup."
//             </p>
//             <p class="testimonial-author">— Marc Chen, CEO</p>
//           </div>

//           <div class="testimonial-card bg-blue">
//             <p class="testimonial-text">
//               "The networking opportunities alone are worth it. I've collaborated with amazing professionals."
//             </p>
//             <p class="testimonial-author">— Emma Wilson, Consultant</p>
//           </div>

//           <div class="testimonial-card bg-pink">
//             <p class="testimonial-text">
//               "Best workspace experience. Clean, equipped, and the people are friendly and professional."
//             </p>
//             <p class="testimonial-author">— David Brown, Developer</p>
//           </div>

//           <div class="testimonial-card bg-orange">
//             <p class="testimonial-text">
//               "Affordable luxury. Premium amenities without the premium price tag. Highly recommended!"
//             </p>
//             <p class="testimonial-author">— Lisa Anderson, Designer</p>
//           </div>
//         </div>
//       </section>

//       <!-- FAQ -->
//       <section class="faq-section">
//         <h2 class="section-title">Your Roadmap to Cowork Clarity</h2>
//         <div class="faq-container">
//           <p-accordion [activeIndex]="0">
//             <p-accordionTab>
//               <ng-template pTemplate="header">
//                 <span>What types of spaces do you offer?</span>
//               </ng-template>
//               <p>We offer dedicated desks, private offices, meeting rooms, and conference spaces tailored to your needs.</p>
//             </p-accordionTab>

//             <p-accordionTab>
//               <ng-template pTemplate="header">
//                 <span>How flexible are the booking terms?</span>
//               </ng-template>
//               <p>Very flexible! Choose from hourly, daily, weekly, or monthly plans. Cancel or modify anytime.</p>
//             </p-accordionTab>

//             <p-accordionTab>
//               <ng-template pTemplate="header">
//                 <span>What's included in the pricing?</span>
//               </ng-template>
//               <p>All spaces include Wi-Fi, utilities, furniture, and access to common areas with complimentary coffee.</p>
//             </p-accordionTab>

//             <p-accordionTab>
//               <ng-template pTemplate="header">
//                 <span>Do you offer membership discounts?</span>
//               </ng-template>
//               <p>Yes! Monthly memberships get automatic discounts and priority access to new spaces.</p>
//             </p-accordionTab>

//             <p-accordionTab>
//               <ng-template pTemplate="header">
//                 <span>How do I manage my bookings?</span>
//               </ng-template>
//               <p>Use our intuitive dashboard to view, modify, and cancel bookings anytime.</p>
//             </p-accordionTab>
//           </p-accordion>
//         </div>
//       </section>

//       <!-- BLOG / ARTICLES -->
//       <section class="blog-section">
//         <h2 class="section-title">Insights, Innovation, and <span class="highlight">Inspiration</span></h2>
//         <div class="blog-grid">
//           <div class="blog-card">
//             <div class="blog-image-placeholder">📊</div>
//             <h3>Emerging Remote Work Trends in 2025</h3>
//             <p class="blog-meta">Strategic insights on the future of workspace</p>
//           </div>

//           <div class="blog-card">
//             <div class="blog-image-placeholder">📱</div>
//             <h3>Maximizing Productivity: Tips from Cowork Members</h3>
//             <p class="blog-meta">Expert advice to boost your workflow</p>
//           </div>

//           <div class="blog-card">
//             <div class="blog-image-placeholder">🚀</div>
//             <h3>Tech Stack: The Backbone of Modern Workspaces</h3>
//             <p class="blog-meta">How technology powers productive collaboration</p>
//           </div>
//         </div>
//       </section>

//       <!-- CTA SECTION -->
//       <section class="cta-section">
//         <h2 class="cta-title">Seize 🎨 The Moment – Join Cowork Today!</h2>
//         <p class="cta-subtitle">
//           Find your perfect workspace and start collaborating with like-minded professionals.
//         </p>
//         <button pButton type="button" label="Get Started Now" icon="pi pi-check"
//                 class="p-button-raised p-button-primary p-button-lg"></button>
//       </section>

//       <app-footer></app-footer>
//     </div>
//   `,
//   styles: [
//     `
//       :host {
//         ::ng-deep {
//           .page-shell {
//             min-height: 100vh;
//             display: flex;
//             flex-direction: column;
//             background: #ffffff;
//           }

//           /* HERO SECTION */
//           .hero-section {
//             background: radial-gradient(circle at top left, rgba(37, 99, 235, 0.12), transparent 40%), #ffffff;
//             padding: 4rem 1.5rem;
//           }

//           .hero-container {
//             max-width: 1200px;
//             margin: 0 auto;
//             display: grid;
//             grid-template-columns: 1fr 1fr;
//             gap: 3rem;
//             align-items: center;
//           }

//           .hero-content h1 {
//             font-size: clamp(2.5rem, 4vw, 3.5rem);
//             margin: 1rem 0;
//             color: #0f172a;
//             line-height: 1.2;
//             font-weight: 700;
//           }

//           .hero-eyebrow {
//             text-transform: uppercase;
//             letter-spacing: 0.1em;
//             color: #2563eb;
//             font-weight: 700;
//             margin: 0 0 0.5rem;
//             font-size: 0.875rem;
//           }

//           .hero-description {
//             color: #475569;
//             font-size: 1.125rem;
//             line-height: 1.75;
//             margin: 1rem 0;
//           }

//           .hero-actions {
//             display: flex;
//             gap: 1rem;
//             margin-top: 2rem;
//             flex-wrap: wrap;
//           }

//           .hero-visual {
//             display: flex;
//             justify-content: center;
//           }

//           .hero-image-placeholder {
//             width: 100%;
//             min-height: 350px;
//             border-radius: 1.5rem;
//             background: linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, #eff6ff 100%);
//             display: grid;
//             place-items: center;
//             text-align: center;
//             padding: 2rem;
//             font-weight: 600;
//             color: #0f172a;
//           }

//           @media (max-width: 768px) {
//             .hero-container {
//               grid-template-columns: 1fr;
//             }
//           }

//           /* LOGO CLOUD */
//           .logo-cloud-section {
//             padding: 3rem 1.5rem;
//             background: #f8fafc;
//           }

//           .logo-cloud-container {
//             max-width: 1200px;
//             margin: 0 auto;
//             display: grid;
//             grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
//             gap: 2rem;
//             align-items: center;
//             text-align: center;
//           }

//           .logo-item {
//             padding: 1.5rem;
//             background: white;
//             border-radius: 0.75rem;
//             border: 1px solid rgba(148, 163, 184, 0.1);
//           }

//           .logo-text {
//             font-weight: 600;
//             color: #0f172a;
//             font-size: 0.95rem;
//           }

//           /* WHY CHOOSE */
//           .why-choose-section {
//             padding: 4rem 1.5rem;
//             background: #ffffff;
//           }

//           .section-title {
//             text-align: center;
//             font-size: clamp(2rem, 4vw, 2.5rem);
//             margin-bottom: 3rem;
//             color: #0f172a;
//             font-weight: 700;
//           }

//           .highlight {
//             background: linear-gradient(135deg, #fbbf24, #f59e0b);
//             -webkit-background-clip: text;
//             -webkit-text-fill-color: transparent;
//             background-clip: text;
//           }

//           .benefits-grid {
//             max-width: 1200px;
//             margin: 0 auto;
//             display: grid;
//             grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
//             gap: 2rem;
//           }

//           .benefit-card {
//             ::ng-deep {
//               .p-card {
//                 border: 1px solid rgba(148, 163, 184, 0.1);
//               }
//             }
//           }

//           .benefit-icon {
//             font-size: 3rem;
//             text-align: center;
//             margin-bottom: 1rem;
//           }

//           .benefit-card h3 {
//             font-size: 1.25rem;
//             margin: 1rem 0 0.75rem;
//             color: #0f172a;
//           }

//           .benefit-description {
//             color: #475569;
//             line-height: 1.6;
//             margin: 0;
//           }

//           /* GALLERY */
//           .gallery-section {
//             padding: 4rem 1.5rem;
//             background: #f8fafc;
//           }

//           .section-subtitle {
//             text-align: center;
//             color: #475569;
//             font-size: 1.125rem;
//             max-width: 600px;
//             margin: 0 auto 2rem;
//             line-height: 1.6;
//           }

//           .carousel-wrapper {
//             max-width: 1000px;
//             margin: 0 auto;
//           }

//           .gallery-item {
//             padding: 2rem;
//           }

//           .gallery-image-placeholder {
//             width: 100%;
//             min-height: 400px;
//             border-radius: 1.5rem;
//             background: linear-gradient(135deg, #3b82f6, #2563eb);
//             display: grid;
//             place-items: center;
//             color: white;
//             font-weight: 600;
//             font-size: 1.5rem;
//           }

//           .gallery-caption {
//             margin-top: 1.5rem;
//             text-align: center;
//             color: #0f172a;
//             font-weight: 600;
//           }

//           /* STATS */
//           .stats-section {
//             padding: 4rem 1.5rem;
//             background: #ffffff;
//           }

//           .stats-grid {
//             max-width: 1200px;
//             margin: 0 auto;
//             display: grid;
//             grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
//             gap: 2rem;
//           }

//           .stat-card {
//             padding: 2rem;
//             background: linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(37, 99, 235, 0.05));
//             border-radius: 1.5rem;
//             border: 1px solid rgba(37, 99, 235, 0.2);
//             text-align: center;
//           }

//           .stat-number {
//             font-size: clamp(2.5rem, 5vw, 3.5rem);
//             font-weight: 700;
//             color: #2563eb;
//             margin-bottom: 0.5rem;
//           }

//           .stat-label {
//             color: #475569;
//             font-weight: 600;
//             margin: 0;
//           }

//           /* TESTIMONIALS */
//           .testimonials-section {
//             padding: 4rem 1.5rem;
//             background: #f8fafc;
//           }

//           .testimonials-grid {
//             max-width: 1200px;
//             margin: 0 auto;
//             display: grid;
//             grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
//             gap: 1.5rem;
//           }

//           .testimonial-card {
//             padding: 1.5rem;
//             border-radius: 1rem;
//             min-height: 200px;
//             display: flex;
//             flex-direction: column;
//             justify-content: space-between;
//           }

//           .testimonial-card.bg-green {
//             background: #d1fae5;
//             color: #065f46;
//           }

//           .testimonial-card.bg-gray {
//             background: #e5e7eb;
//             color: #374151;
//           }

//           .testimonial-card.bg-blue {
//             background: #dbeafe;
//             color: #1e40af;
//           }

//           .testimonial-card.bg-pink {
//             background: #fbcfe8;
//             color: #be185d;
//           }

//           .testimonial-card.bg-orange {
//             background: #fed7aa;
//             color: #b45309;
//           }

//           .testimonial-text {
//             font-style: italic;
//             line-height: 1.6;
//             margin: 0 0 1rem;
//           }

//           .testimonial-author {
//             font-weight: 600;
//             margin: 0;
//             font-size: 0.95rem;
//           }

//           /* FAQ */
//           .faq-section {
//             padding: 4rem 1.5rem;
//             background: #ffffff;
//           }

//           .faq-container {
//             max-width: 800px;
//             margin: 0 auto;
//           }

//           /* BLOG */
//           .blog-section {
//             padding: 4rem 1.5rem;
//             background: #f8fafc;
//           }

//           .blog-grid {
//             max-width: 1200px;
//             margin: 0 auto;
//             display: grid;
//             grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
//             gap: 2rem;
//           }

//           .blog-card {
//             background: white;
//             border-radius: 1rem;
//             overflow: hidden;
//             border: 1px solid rgba(148, 163, 184, 0.1);
//             transition: transform 0.3s ease, box-shadow 0.3s ease;
//           }

//           .blog-card:hover {
//             transform: translateY(-4px);
//             box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
//           }

//           .blog-image-placeholder {
//             width: 100%;
//             height: 200px;
//             background: linear-gradient(135deg, #3b82f6, #2563eb);
//             display: grid;
//             place-items: center;
//             font-size: 3rem;
//           }

//           .blog-card h3 {
//             padding: 1.5rem 1.5rem 0.5rem;
//             margin: 0;
//             color: #0f172a;
//             font-weight: 600;
//           }

//           .blog-meta {
//             padding: 0 1.5rem 1.5rem;
//             margin: 0;
//             color: #64748b;
//             font-size: 0.875rem;
//           }

//           /* CTA */
//           .cta-section {
//             padding: 4rem 1.5rem;
//             background: linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(16, 185, 129, 0.1));
//             text-align: center;
//           }

//           .cta-title {
//             font-size: clamp(2rem, 4vw, 2.75rem);
//             margin-bottom: 1rem;
//             color: #0f172a;
//             font-weight: 700;
//           }

//           .cta-subtitle {
//             font-size: 1.125rem;
//             color: #475569;
//             margin-bottom: 2rem;
//             max-width: 600px;
//             margin-left: auto;
//             margin-right: auto;
//             line-height: 1.6;
//           }
//         }
//       }
//     `,
//   ],
// })
// export class HomeComponent {
//   galleryImages = [
//     {
//       title: 'Modern Office Spaces',
//       description: 'Bright and spacious offices designed for collaboration',
//     },
//     {
//       title: 'Meeting Rooms',
//       description: 'Well-equipped meeting rooms for brainstorming sessions',
//     },
//     {
//       title: 'Collaborative Zones',
//       description: 'Open spaces perfect for team projects and networking',
//     },
//     {
//       title: 'Quiet Focus Areas',
//       description: 'Dedicated zones for concentrated work',
//     },
//   ];
// }
