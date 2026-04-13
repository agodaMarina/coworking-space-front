# 📱 Coworking Frontend - Documentation Complète

**Version:** 1.0.0
**Framework:** Angular 21 (Standalone Components)
**Date de mise à jour:** 12 Avril 2026

---

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Installation & Configuration](#installation--configuration)
4. [Structure des Dossiers](#structure-des-dossiers)
5. [Composants & Pages](#composants--pages)
6. [Services](#services)
7. [Intercepteurs & Middleware](#intercepteurs--middleware)
8. [État et Signaux](#état-et-signaux)
9. [Authentification](#authentification)
10. [Gestion des Erreurs](#gestion-des-erreurs)
11. [Styles et Thème](#styles-et-thème)
12. [Tests](#tests)
13. [Déploiement](#déploiement)
14. [FAQ & Troubleshooting](#faq--troubleshooting)

---

## Vue d'ensemble

### Objectif
Application web responsive pour gérer les réservations d'espaces de coworking. Les utilisateurs peuvent:
- Consulter les espaces disponibles avec filtres
- Réserver des espaces (par heure ou par jour)
- Gérer leurs réservations
- S'authentifier (connexion/inscription)

### Technologies Principales
- **Frontend:** Angular 21, PrimeNG 21 (UI Components)
- **État:** Angular Signals
- **HTTP:** RxJS + HttpClient
- **Auth:** JWT Tokens (localStorage)
- **Styling:** CSS3 + Figma Design System

### Mode Développement
- **Mock Data:** Activable par signal dans les services
- **Dev Server:** ng serve (port 4200)
- **Build:** ng build (dist/coworking-front/)

---

## Architecture

### Patterns Utilisés
```
┌─────────────────────────────────────────────────┐
│  Components (Standalone)                        │
│  ├─ Pages (Lazy-loaded)                         │
│  ├─ Shared (Global components)                  │
│  └─ Features (Feature-specific)                 │
├─────────────────────────────────────────────────┤
│  Services (Root Injection)                      │
│  ├─ API Service (HTTP base)                     │
│  ├─ Auth Service (Token + User)                 │
│  ├─ Spaces Service (Workspaces)                 │
│  ├─ Reservations Service (Bookings)             │
│  └─ Toast Service (Notifications)               │
├─────────────────────────────────────────────────┤
│  Guards & Interceptors                          │
│  ├─ Auth Guard (Route protection)               │
│  └─ Auth Interceptor (JWT + Error handling)     │
├─────────────────────────────────────────────────┤
│  Routes (config: app.routes.ts)                 │
│  ├─ / → /home (redirect)                        │
│  ├─ /home (public)                              │
│  ├─ /login (public)                             │
│  ├─ /register (public)                          │
│  ├─ /spaces (public)                            │
│  ├─ /spaces/:id (public)                        │
│  └─ /booking (protected)                        │
└─────────────────────────────────────────────────┘
```

### Data Flow
```
User Action
    ↓
Component (template)
    ↓
Service (RxJS Observable)
    ↓
HTTP Interceptor (JWT injection + Auth)
    ↓
API/Mock Data
    ↓
HttpClient Response
    ↓
Error Handler (catch + classify)
    ↓
Toast Service (notification)
    ↓
Component (re-render with Signal)
```

---

## Installation & Configuration

### Prérequis
```bash
Node.js 18+
npm 8+
Angular CLI 21+
```

### Installation
```bash
# Cloner le repository
git clone <repo-url>
cd coworking-front

# Installer les dépendances
npm install

# Installer les dépendances supplémentaires
npm install primeng primeicons
```

### Configuration d'Environnement
Créer un fichier `.env` (optionnel):
```
ANGULAR_APP_API_URL=http://localhost:8000/api
ANGULAR_APP_USE_MOCKS=false
```

### Démarrage du Serveur de Développement
```bash
# Démarrer sur le port 4200
npm start

# Ou avec un port spécifique
ng serve --port 4300

# Ouvrir http://localhost:4200
```

### Build de Production
```bash
# Build optimisé
npm run build

# Résultat dans dist/coworking-front/
```

---

## Structure des Dossiers

```
coworking-front/
├── src/
│   ├── app/
│   │   ├── core/                          # Services, Guards, Interceptors
│   │   │   ├── services/
│   │   │   │   ├── api.service.ts         # HTTP wrapper
│   │   │   │   ├── auth.service.ts        # Auth + User state
│   │   │   │   ├── spaces.service.ts      # Spaces CRUD + Mock
│   │   │   │   ├── reservations.service.ts# Reservations CRUD + Mock
│   │   │   │   └── toast.service.ts       # Notifications
│   │   │   ├── auth.guard.ts              # Route guard
│   │   │   └── auth.interceptor.ts        # HTTP interceptor
│   │   ├── features/
│   │   │   ├── home/
│   │   │   │   └── home.component.ts      # Landing page (hero, features, blog)
│   │   │   ├── auth/
│   │   │   │   ├── login.component.ts     # Login form
│   │   │   │   ├── register.component.ts  # Registration form
│   │   │   │   └── profile.component.ts   # User profile (commented)
│   │   │   ├── spaces/
│   │   │   │   ├── space-list.component.ts # Spaces listing + filters + modal
│   │   │   │   └── space-detail.component.ts # Space detail view
│   │   │   └── booking/
│   │   │       └── booking.component.ts   # Multi-step booking form
│   │   ├── shared/
│   │   │   └── components/
│   │   │       ├── header/                # Navigation header
│   │   │       ├── footer/                # Footer
│   │   │       └── toast-container/       # Toast notification wrapper
│   │   ├── app.ts                         # Root component
│   │   ├── app.html                       # Root template
│   │   ├── app.css                        # Root styles
│   │   ├── app.config.ts                  # App configuration (providers)
│   │   └── app.routes.ts                  # Route definitions
│   ├── main.ts                            # Application entry point
│   ├── index.html                         # HTML skeleton
│   └── styles.css                         # Global styles
├── angular.json                           # Angular CLI config
├── tsconfig.json                          # TypeScript config
├── package.json                           # Dependencies
└── DOCUMENTATION.md                       # Cette documentation
```

---

## Composants & Pages

### 1. **Home Page** (`features/home/home.component.ts`)
**Status:** ✅ Complete

**Sections:**
- Hero section avec CTA
- Logo cloud (5 types d'entreprises)
- "Why Choose Cowork" (3 cards)
- Galerie Carousel (auto-play)
- Statistiques (4 cards)
- Témoignages (5 colored cards)
- Blog (3 articles)
- CTA "Seize the Moment"

**Responsive:** Mobile-first design, breakpoints CSS

**Imports PrimeNG:** Carousel, Card, Button

---

### 2. **Spaces List** (`features/spaces/space-list.component.ts`)
**Status:** ✅ Complete

**Features:**
- Table desktop avec tri (PrimeNG Table)
- Grille mobile responsive
- Filtrage par type d'espace
- Slider capacité (0-100 personnes)
- Modal détails de l'espace
- Boutons "View" et "Book"
- Loading overlay + spinner pendant API call

**Signals:**
```typescript
spaces = signal<Space[]>([])                // Spaces fetched
selectedSpace = signal<Space | null>(null)  // Modal state
showDetailModal = signal(false)              // Modal visibility
selectedType = signal<string | null>(null)  // Filter state
capacityRange = signal<[number, number]>([0, 100]) // Range filter
```

**Services:** SpacesService (getSpaces, getSpace)

**Imports PrimeNG:** Table, Button, Dialog, Select, Slider, ProgressSpinner

---

### 3. **Space Detail** (`features/spaces/space-detail.component.ts`)
**Status:** ✅ Basic (Ready for enhancement)

**Features:**
- Breadcrumb navigation
- Space details display
- Amenities list
- Book button

**Future:**
- Photo carousel
- Reviews section
- Availability calendar

---

### 4. **Booking Form** (`features/booking/booking.component.ts`)
**Status:** ✅ Complete

**Multi-step Form:**
1. Select Space (dropdown)
2. Select Dates (start/end DatePickers)
3. Booking Type (Hourly/Daily/Monthly radios)
4. Time Selection (if hourly)
5. Recurrence (optional checkbox)
6. Special Requests (textarea)

**Features:**
- Form validation (Reactive Forms)
- Pricing calculation
- Booking summary card
- Success message on submit
- Loading state on button

**Signals:**
```typescript
bookingForm: FormGroup           // Reactive form
bookingSuccess = signal(false)   // Success state
```

**Services:** ReservationsService (createReservation)

**Imports PrimeNG:** Button, DatePicker, RadioButton, Checkbox, Select, Textarea

---

### 5. **Login Page** (`features/auth/login.component.ts`)
**Status:** ✅ Complete

**Features:**
- Email + Password inputs
- "Remember me" checkbox
- "Forgot password" link
- Links to register & home
- Error messages
- Loading state

**Services:** AuthService (login)

**Imports PrimeNG:** Button, InputText, Password, Checkbox

---

### 6. **Register Page** (`features/auth/register.component.ts`)
**Status:** ✅ Complete

**Features:**
- Name, Email, Password inputs
- Password confirmation
- Terms & conditions checkbox
- Links to login & home
- Error messages
- Loading state

**Services:** AuthService (register)

**Imports PrimeNG:** Button, InputText, Password, Checkbox

---

### 7. **Toast Container** (`shared/components/toast-container/toast-container.component.ts`)
**Status:** ✅ Complete

**Features:**
- Root-level PrimeNG Toast widget
- Watches toastService.toastList() signal
- Auto-dismiss (3-5 seconds)
- Prevents duplicate notifications
- Top-right positioning

**Logic:**
```typescript
effect(() => {
  const toasts = this.toastService.toastList();
  toasts.forEach(toast => {
    // Add to PrimeNG MessageService only if not already processed
    if (!this.processedToastIds.has(toast.id)) {
      this.messageService.add({...});
      this.processedToastIds.add(toast.id);
    }
  });
});
```

---

### 8. **Header** (`shared/components/header/header.component.ts`)
**Status:** ✅ Complete

**Features:**
- Logo
- Navigation menu (Home, Spaces, Login, Register, Booking)
- Responsive hamburger (mobile)
- Active link highlighting

---

### 9. **Footer** (`shared/components/footer/footer.component.ts`)
**Status:** ✅ Complete

**Sections:**
- Company info
- Quick links
- Social media
- Copyright

---

## Services

### 1. **API Service** (`core/api.service.ts`)
**Base class for HTTP calls**

```typescript
export class ApiService {
  protected readonly http = inject(HttpClient);
  protected apiUrl = 'http://localhost:8000/api'; // Django backend

  protected get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${endpoint}`);
  }

  protected post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, body);
  }

  // ... patch, put, delete methods
}
```

---

### 2. **Auth Service** (`core/auth.service.ts`)
**Manages user authentication & state**

```typescript
// Signals
readonly accessTokenSignal = signal<string | null>(...)  // JWT token
readonly userSignal = signal<User | null>(...)           // User data
readonly isAuthenticated = computed(...)                 // Computed auth state

// Methods
login(payload: LoginPayload): Observable<AuthResponse>
register(payload: RegisterPayload): Observable<AuthResponse>
logout(): void
refreshAccessToken(): Observable<{ access: string }>
loadProfile(): Observable<User>

// Storage (localStorage keys)
coworking_access_token
coworking_refresh_token
coworking_user
```

**Features:**
- JWT token management
- localStorage persistence
- Mock login credentials:
  - Email: `admin@coworking.com`
  - Password: `admin1234`
- Auto-sync with localStorage via effect()

---

### 3. **Spaces Service** (`core/services/spaces.service.ts`)
**Manages workspace data**

```typescript
// Signals
readonly isLoading = signal(false)  // Loading state for API calls
private readonly useMocks = signal(false)  // Toggle mock vs API

// Methods
getSpaces(): Observable<Space[]>
getAvailableSpaces(): Observable<Space[]>
getSpace(id: number): Observable<Space>
getAmenities(): Observable<Amenity[]>
toggleMocks(): void

// Mock Data (3 spaces)
- Downtown Desk #1 (desk, 1 person, $10/hour, $25/day)
- Collaborative Space (open_space, 10 people, $50/hour, $150/day)
- Executive Meeting Room (meeting_room, 8 people, $30/hour, $75/day)
```

**Loading State Pattern:**
```typescript
getSpaces(): Observable<Space[]> {
  return (...).pipe(
    tap(() => this.isLoading.set(true)),
    finalize(() => this.isLoading.set(false))  // Auto-cleanup
  );
}
```

---

### 4. **Reservations Service** (`core/services/reservations.service.ts`)
**Manages booking data**

```typescript
// Signals
readonly isLoading = signal(false)  // Loading state for API calls
private readonly useMocks = signal(false)

// Methods
getReservations(): Observable<Reservation[]>
createReservation(data: CreateReservation): Observable<Reservation>
getReservation(id: number): Observable<Reservation>
cancelReservation(id: number): Observable<any>
toggleMocks(): void

// Interfaces
interface Reservation {
  id: number
  user_detail: any
  space_detail: any
  start_datetime: string   // ISO 8601
  end_datetime: string
  status: 'pending' | 'confirmed' | 'cancelled'
  total_price: number
  billing_type: 'hourly' | 'daily'
  is_recurring: boolean
  notes: string
}

interface CreateReservation {
  space_id: number
  start_datetime: string
  end_datetime: string
  billing_type: 'hourly' | 'daily'
  is_recurring?: boolean
  recurrence_rule?: string
  notes?: string
}
```

---

### 5. **Toast Service** (`core/services/toast.service.ts`)
**Manages notifications queue**

```typescript
// Signal
readonly toastList = this.toasts.asReadonly()  // Readonly list

// Methods
showSuccess(message: string, duration?: number): void
showError(message: string, duration?: number): void
showWarning(message: string, duration?: number): void
showInfo(message: string, duration?: number): void
remove(id: string): void       // Manual removal
clear(): void                  // Clear all

// Interface
interface Toast {
  id: string
  message: string
  severity: 'success' | 'error' | 'warning' | 'info'
  duration?: number  // ms (0 = no auto-dismiss)
}

// Default Durations
success: 3000ms
error: 5000ms
warning: 4000ms
info: 3000ms
```

**Usage Example:**
```typescript
constructor(private toastService: ToastService) {}

someMethod() {
  this.myService.doSomething().subscribe({
    next: (data) => this.toastService.showSuccess('Operation successful!'),
    error: (err) => this.toastService.showError('An error occurred')
  });
}
```

---

## Intercepteurs & Middleware

### Auth Interceptor (`core/auth.interceptor.ts`)
**Automatic JWT injection & error handling**

```typescript
intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  // 1. Inject JWT token
  const token = this.authService.token();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  // 2. Handle responses & errors
  return next.handle(req).pipe(
    catchError((error: HttpErrorResponse) => {
      return this.handleError(error);
    })
  );
}
```

**Error Classification:**
| Status | Action | Toast |
|--------|--------|-------|
| 401 | Clear auth, logout | "Session expirée" |
| 403 | - | "Accès refusé" |
| 404 | - | "Ressource non trouvée" |
| 5xx | - | "Erreur serveur" |
| 0 | - | "Erreur de connexion" |

**Error Message Extraction:**
```
response.error.detail   (Django REST Framework)
response.error.message  (Custom API)
response.statusText     (HTTP status text)
```

---

## État et Signaux

### Pattern Signaux Utilisés

**1. Simple State:**
```typescript
const isLoading = signal(false);
const selectedItem = signal<Item | null>(null);
```

**2. Computed Derived State:**
```typescript
const filteredItems = computed(() => {
  return items().filter(i => i.type === selectedType());
});
```

**3. Side Effects:**
```typescript
// Auto-save to localStorage
effect(() => {
  const user = userSignal();
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
});
```

**4. Form Binding (Reactive):**
```typescript
form = new FormGroup({
  email: new FormControl('', Validators.required),
  password: new FormControl('', [...]),
});

// Template:
<input [formControl]="form.get('email')" />
<div *ngIf="form.get('email')?.invalid">Error</div>
```

### RxJS Patterns

**Loading States:**
```typescript
observable.pipe(
  tap(() => isLoading.set(true)),        // Set before request
  finalize(() => isLoading.set(false))   // Always clear after (error/success)
)
```

**Error Handling:**
```typescript
observable.pipe(
  catchError(error => {
    this.toastService.showError(error.message);
    return throwError(() => error);  // Re-throw for component handling
  })
)
```

---

## Authentification

### Flow d'Authentification

```
User fills login form
        ↓
Component → AuthService.login()
        ↓
HTTP POST /api/auth/login/
        ↓
Backend returns { access, refresh, user }
        ↓
AuthService stores tokens + user in:
  - Signals (accessTokenSignal, userSignal)
  - localStorage (coworking_access_token, coworking_user)
        ↓
Component navigates to /home (or returnUrl)
        ↓
Protected routes check authGuard
        ↓
authGuard reads authService.isAuthenticated()
        ↓
If true → allow navigation
If false → redirect to /login with queryParams.returnUrl
```

### Token Management

**Initial Load:**
```typescript
constructor() {
  // Read from localStorage on init
  const token = localStorage.getItem('coworking_access_token');
  this.accessTokenSignal.set(token);

  // Optionally refresh if stale
  if (token && !userSignal()) {
    this.loadProfile().subscribe(...);
  }
}
```

**Automatic Injection:**
```typescript
// In interceptor
const token = this.authService.token();
if (token) {
  req = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });
}
```

**On 401 Response:**
```typescript
// In interceptor error handler
if (error.status === 401) {
  this.authService.logout();
  this.toastService.showError('Votre session a expiré');
  this.router.navigate(['/login']);
}
```

### Mock Mode
```typescript
// Toggle in AuthService
this.useMocks.set(!this.useMocks());

// Test credentials
Email: admin@coworking.com
Password: admin1234
```

---

## Gestion des Erreurs

### Erreurs Anticipées

**1. Network Errors (status 0):**
```
Cause: No internet, CORS issue, server down
Toast: "❌ Erreur de connexion. Vérifiez votre réseau"
Action: User can retry
```

**2. Authentication Errors (401):**
```
Cause: Token expired, invalid token
Toast: "⚠️ Votre session a expiré. Veuillez vous reconnecter"
Action: Auto-redirect to /login
```

**3. Authorization Errors (403):**
```
Cause: User lacks permission
Toast: "🚫 Accès refusé"
Action: Stay on page, suggest contact admin
```

**4. Not Found (404):**
```
Cause: Resource deleted, invalid ID
Toast: "❓ Ressource non trouvée"
Action: Redirect to listing or home
```

**5. Server Errors (5xx):**
```
Cause: Backend crash, database issue
Toast: "⛔ Erreur serveur. Réessayez plus tard"
Action: User can retry, contact support
```

---

## Styles et Thème

### Design System (Figma Colors)

**Primary:** `#2563eb` (Blue)
**Secondary:** `#64748b` (Gray)
**Accent:** `#10b981` (Green)
**Background:** `#f8fafc` (Light)

### CSS Architecture

```
Global Styles (styles.css)
├── CSS Variables (--primary, --secondary, etc.)
├── Font imports
├── Reset
└── Base element styles

Component Styles (scoped to component)
├── Layout (grid, flex)
├── Typography
├── Colors
├── Spacing (margin, padding)
├── Responsive media queries
└── Interactive states (:hover, :focus)
```

### Responsive Breakpoints
```css
Mobile: < 768px
Tablet: 768px - 1024px
Desktop: > 1024px

Media queries used:
@media (max-width: 768px) { ... }
@media (min-width: 1024px) { ... }
```

### PrimeNG Customization
```typescript
// In app.config.ts
providePrimeNG({
  ripple: true,  // Ripple effect on buttons
  // Future: add custom theme configuration
})
```

---

## Tests

### Unit Tests (Karma + Jasmine)

**Current Status:** Setup ready but tests not written

**Test files location:** `*.spec.ts`

**Command:**
```bash
npm run test
```

### Example Test Structure
```typescript
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService],
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should login with valid credentials', () => {
    const credentials = { email: 'test@test.com', password: 'pass123' };
    service.login(credentials).subscribe(response => {
      expect(response.user).toBeDefined();
      expect(service.token()).toBeTruthy();
    });

    const req = httpMock.expectOne('/api/auth/login/');
    expect(req.request.method).toBe('POST');
    req.flush({ access: 'token', user: {...} });
  });
});
```

---

## Déploiement

### Build de Production
```bash
# Optimized bundle
npm run build

# Output: dist/coworking-front/

# Size metrics
Initial: ~43KB (gzipped)
With lazy chunks: ~200KB total
```

### Environnements Recommandés

1. **Vercel** (Free tier available)
2. **Netlify** (Free tier available)
3. **AWS S3 + CloudFront**
4. **Docker** (pour monorepo)

---

## FAQ & Troubleshooting

### Q: La page est blanche au démarrage
**A:**
- Vérifier la console du navigateur (F12) pour les erreurs JS
- Vérifier les requêtes réseau en F12 → Network tab
- Vérifier que le serveur API (Django) est accessible
- Nettoyer localStorage: `localStorage.clear()`
- Attendre le chargement complet des chunks lazy-loaded

### Q: Les tokens ne se sauvegardent pas
**A:**
- Vérifier que localStorage est activé dans le navigateur
- Vérifier les clés stockées: `localStorage.getItem('coworking_access_token')`
- Vérifier les headers Authorization en F12 → Network

### Q: Les toasts ne s'affichent pas
**A:**
- Vérifier que `<app-toast-container>` est dans `app.html`
- Vérifier les imports de PrimeNG Toast
- Vérifier que `toastService.toastList()` contient des éléments

### Q: Erreur CORS
**A:**
- Le backend Django doit avoir les CORS configurés
- Vérifier les headers `Access-Control-Allow-Origin` en F12

---

## Commits Historiques

```
bfe8100 - Phase 1-2: PrimeNG setup + Home page
0c472a3 - Phase 2: Spaces page avec DataTable
1a2c3d4 - Phase 3: API integration + Services
2b3c4d5 - Phase 3 (cont.): Auth pages + Booking form
3c4d5e6 - Advanced features: HTTP interceptors, Toasts, Loading states (LATEST)
```

---

## Notes de Développement

### Code Style
- Composants standalone obligatoires
- Services injectables (providedIn: 'root')
- Types TypeScript stricts
- Imports groupés (Angular → PrimeNG → Local)

### Conventions de Nommage
```
Components:    MyFeature.component.ts
Services:      my-feature.service.ts
Interfaces:    MyInterface (PascalCase)
Signals:       mySignal (camelCase)
```

---

**Dernière mise à jour:** 12 Avril 2026
**Mainteneur:** Marina
**License:** MIT

