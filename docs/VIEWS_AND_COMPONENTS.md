# Coworking Space — Documentation

> Angular 17+ · Standalone components · Signals · Reactive Forms · Tailwind CSS

---

## Table des matières

1. [Vues côté utilisateur](#1-vues-côté-utilisateur)
2. [Vues côté admin](#2-vues-côté-admin)
3. [Composants partagés](#3-composants-partagés)
4. [Ce qui reste à faire](#4-ce-qui-reste-à-faire)

---

## 1. Vues côté utilisateur

Routes sous `/` — layout avec `app-header` + `app-footer`.

### `/home` — Page d'accueil

**Composant :** `HomePageComponent`

Section marketing principale. Contient :
- Hero avec CTA vers `/spaces`
- Grille de fonctionnalités (icônes + textes)
- Compteurs statistiques animés (membres, espaces, villes…)
- Témoignages utilisateurs
- FAQ accordéon
- Section blog (cartes d'articles)

**État :** Statique (données codées en dur). Aucun service branché.

---

### `/spaces` — Liste des espaces

**Composant :** `SpaceListPageComponent`

Catalogue des espaces disponibles. Contient :
- Barre de recherche par nom
- Filtres par type d'espace (hot desk, open space, meeting room, private, conference)
- Grille de cartes d'espaces avec photo, prix et disponibilité
- Lien vers le détail de chaque espace

**Service :** `SpacesService.getAvailableSpaces()` (mock activé par défaut).

---

### `/spaces/:id` — Détail d'un espace

**Composant :** `SpaceDetailPageComponent`

Fiche complète d'un espace. Contient :
- Galerie photos (carousel ou miniatures)
- Description, capacité, adresse
- Liste des équipements / amenities avec icônes
- Grille de tarifs (à l'heure / à la journée)
- Bouton « Book now » → `/booking`

**Service :** `SpacesService.getSpace(id)`.

---

### `/booking` — Réservation

**Composant :** `BookingPageComponent`

Tunnel de réservation en 3 étapes :

| Étape | Contenu |
|-------|---------|
| 1 — Details | Sélection des dates (`app-date-picker`), type de facturation, récurrence optionnelle |
| 2 — Payment | Formulaire de paiement (numéro de carte, expiration, CVV) |
| 3 — Confirmation | Récapitulatif et message de succès |

**Service :** `ReservationsService.createReservation()`.

---

### `/login` — Connexion

**Composant :** `LoginPageComponent`

Formulaire email + mot de passe. Gère les erreurs d'authentification.
Lien vers `/register`.

**Service :** `AuthService.login()`.

---

### `/register` — Inscription

**Composant :** `RegisterPageComponent`

Formulaire nom + email + mot de passe.
Lien vers `/login`.

**Service :** `AuthService.register()`.

---

### `/dashboard` — Espace utilisateur

Layout avec `app-sidebar` et `<router-outlet>`.

| Route | Composant | Description |
|-------|-----------|-------------|
| `/dashboard/overview` | `OverviewComponent` | Stats personnelles (réservations actives, à venir, total dépensé) + liste des réservations récentes |
| `/dashboard/bookings` | `BookingsComponent` | Historique complet des réservations avec filtres (all / upcoming / past / cancelled) et action d'annulation |
| `/dashboard/spaces` | `DashboardSpacesComponent` | Catalogue des espaces avec recherche et filtres (identique à `/spaces` mais dans le contexte dashboard) |
| `/dashboard/payments` | `DashboardPaymentsComponent` | Historique des paiements + modal de paiement pour les factures en attente |
| `/dashboard/profile` | `ProfileComponent` | Affichage du profil (nom, avatar initiales) |

---

## 2. Vues côté admin

Route parente `/admin` — layout avec `app-admin-sidebar` et `<router-outlet>`.
Toutes les données sont mockées (aucun guard d'auth admin en place).

### `/admin/overview` — Tableau de bord

**Composant :** `AdminOverviewComponent`

Métriques globales de la plateforme :
- Total utilisateurs, revenus, réservations actives, espaces disponibles
- Tableau des réservations récentes (5 dernières)

---

### `/admin/users` — Gestion des utilisateurs

**Composant :** `AdminUsersComponent`

| Fonctionnalité | Détail |
|----------------|--------|
| Liste | Nom, email, rôle (badge), statut, date d'inscription |
| Recherche | Par nom ou email |
| Créer | Drawer latéral : nom, email, mot de passe, rôle (`app-select`), statut (`app-toggle`) |
| Éditer | Même drawer pré-rempli (sans champ mot de passe) |
| Activer / Désactiver | Toggle rapide en ligne |
| Supprimer | `app-confirm-dialog` + toast de confirmation |

---

### `/admin/spaces` — Gestion des espaces

**Composant :** `AdminSpacesComponent`

| Fonctionnalité | Détail |
|----------------|--------|
| Liste | Nom, adresse, type (badge coloré), capacité, prix/h, prix/j, statut |
| Filtres | Recherche texte + filtre par type (`app-select`) |
| Créer | Drawer : nom, type, adresse, description, capacité, prix/h, prix/j, disponibilité |
| Éditer | Même drawer pré-rempli |
| Ouvrir / Fermer | Toggle rapide de disponibilité en ligne |
| Supprimer | `app-confirm-dialog` + toast |

---

### `/admin/equipment` — Inventaire des équipements

**Composant :** `AdminEquipmentComponent`

| Fonctionnalité | Détail |
|----------------|--------|
| Liste | Nom, espace associé, quantité, condition (badge) |
| Recherche | Par nom ou espace |
| Créer | Drawer : nom, espace (`app-select`), quantité, condition (`app-select` avec badges) |
| Éditer | Même drawer pré-rempli |
| Supprimer | `app-confirm-dialog` + toast |

---

### `/admin/reservations` — Gestion des réservations

**Composant :** `AdminReservationsComponent`

| Fonctionnalité | Détail |
|----------------|--------|
| Liste | Utilisateur, espace, dates, facturation, statut, montant |
| Filtres | Tabs : All / Confirmed / Pending / Cancelled |
| Créer | Drawer : utilisateur, espace, dates (2× `app-date-picker`), facturation, montant, statut, notes |
| Éditer | Même drawer pré-rempli |
| Supprimer | `app-confirm-dialog` + toast |

---

### `/admin/payments` — Paiements

**Composant :** `AdminPaymentsComponent`

| Fonctionnalité | Détail |
|----------------|--------|
| Liste | Facture, utilisateur, espace, date, montant, statut (paid / pending / refunded) |
| Filtres | Tabs par statut |
| Calcul | Total des revenus affiché en stat |

Vue lecture seule (les paiements sont générés depuis les réservations).

---

### `/admin/notifications` — Notifications

**Composant :** `AdminNotificationsComponent`

| Fonctionnalité | Détail |
|----------------|--------|
| Liste | Type (badge), titre + message, cible, date, statut (sent / scheduled / failed) |
| Créer | Drawer : titre, message, type (`app-select`), cible (`app-select` + champ user si "custom"), toggle envoi immédiat / planifié, `app-date-picker` si planifié |
| Supprimer | `app-confirm-dialog` + toast |

---

## 3. Composants partagés

Tous les composants sont **standalone** et implémentent `ControlValueAccessor` (compatibles `formControlName` et `[formControl]`) sauf mention contraire.

### Contrôles de formulaire

#### `app-input`

```html
<app-input
  formControlName="name"
  type="text"          <!-- text | email | password | number -->
  placeholder="…"
  icon="lucide:user"   <!-- optionnel, clé Iconify -->
  [mono]="false"       <!-- police monospace -->
  [disabled]="false"
></app-input>
```

---

#### `app-textarea`

```html
<app-textarea
  formControlName="description"
  placeholder="…"
  [rows]="3"
></app-textarea>
```

---

#### `app-select`

Dropdown custom avec support de badges pastels sur les options.

```html
<app-select
  formControlName="type"
  [options]="typeOptions"  <!-- SelectOption<T>[] -->
  placeholder="Choose…"
  icon="lucide:layout"     <!-- optionnel -->
></app-select>
```

```typescript
// Interface SelectOption<T>
{ label: string; value: T; badge?: string /* classes Tailwind */ }
```

---

#### `app-toggle`

Switch on/off accessible (`role="switch"`, `aria-checked`).

```html
<app-toggle
  formControlName="available"
  label="Space is available"
></app-toggle>
```

---

#### `app-date-picker`

Calendrier inline avec navigation mois/année et contrainte de date minimale.

```html
<app-date-picker
  formControlName="startDate"
  [min]="today()"       <!-- format ISO YYYY-MM-DD, optionnel -->
  placeholder="Pick a date…"
></app-date-picker>
```

---

#### `app-table` + `app-column`

Table générique avec colonnes déclaratives et cell templates Angular.

```html
<app-table [rows]="paginated()" emptyMessage="No spaces found.">

  <app-column label="Name" flex="1">
    <ng-template let-s>
      <p class="text-sm font-medium text-zinc-900">{{ s.name }}</p>
    </ng-template>
  </app-column>

  <app-column label="Type" width="130px">
    <ng-template let-s>
      <span class="badge" [ngClass]="typeBadge(s.type)">{{ s.typeDisplay }}</span>
    </ng-template>
  </app-column>

  <app-column label="Actions" width="100px" align="right">
    <ng-template let-s>
      <button (click)="openEdit(s)">Edit</button>
    </ng-template>
  </app-column>

</app-table>
```

**`app-column` inputs :**

| Input | Type | Description |
|-------|------|-------------|
| `label` | `string` | En-tête de colonne |
| `flex` | `string` | Facteur `fr` dans la grille CSS (ex. `'1'` → `1fr`) |
| `width` | `string` | Largeur fixe (ex. `'130px'`). Mutuellement exclusif avec `flex` |
| `align` | `'left' \| 'right' \| 'center'` | Alignement header + cellule (défaut `left`) |

---

#### `app-pagination`

Pagination générique. S'affiche uniquement si `total > pageSize`.

```html
<app-pagination
  [total]="filtered().length"
  [pageSize]="8"
  [current]="page()"
  (pageChange)="page.set($event)">
</app-pagination>
```

| Input | Type | Défaut | Description |
|-------|------|--------|-------------|
| `total` | `number` | `0` | Nombre total d'items |
| `pageSize` | `number` | `8` | Items par page |
| `current` | `number` | `1` | Page active (1-indexée) |

| Output | Type |
|--------|------|
| `pageChange` | `EventEmitter<number>` |

Affiche jusqu'à 7 numéros de page avec ellipses (`…`) pour les longues listes.

---

### Layout & navigation

| Composant | Sélecteur | Description |
|-----------|-----------|-------------|
| Header | `app-header` | Barre de navigation principale (logo, liens, auth) |
| Footer | `app-footer` | Pied de page |
| Sidebar (user) | `app-sidebar` | Navigation latérale du dashboard utilisateur |
| Sidebar (admin) | `app-admin-sidebar` | Navigation latérale du panneau admin |

---

### Feedback & dialogues

#### `app-confirm-dialog`

Modal de confirmation centré. **Non** ControlValueAccessor — utiliser avec `@if`.

```html
@if (pendingDeleteId() !== null) {
  <app-confirm-dialog
    title="Delete space?"
    message="This action cannot be undone."
    confirmLabel="Delete"
    (confirmed)="confirmDelete()"
    (cancelled)="cancelDelete()">
  </app-confirm-dialog>
}
```

| Input | Type | Défaut |
|-------|------|--------|
| `title` | `string` | `'Are you sure?'` |
| `message` | `string` | `'This action cannot be undone.'` |
| `confirmLabel` | `string` | `'Delete'` |

| Output | Type |
|--------|------|
| `confirmed` | `EventEmitter<void>` |
| `cancelled` | `EventEmitter<void>` |

---

#### `ToastService`

Service injectable (`providedIn: 'root'`). Câblé via `app-toast-container` dans le layout racine.

```typescript
constructor(private toast: ToastService) {}

this.toast.showSuccess('Space created.');
this.toast.showError('Something went wrong.');
this.toast.showWarning('Unsaved changes.');
this.toast.showInfo('Tip: you can filter by type.');
```

---

## 4. Ce qui reste à faire

### Fonctionnel

| Priorité | Item | Description |
|----------|------|-------------|
| 🔴 Haute | Service partagé espaces | `AdminSpacesComponent` et `AdminEquipmentComponent` utilisent des listes d'espaces codées en dur séparément. Créer un `AdminDataService` ou étendre `SpacesService` pour partager l'état. |
| 🔴 Haute | Guards de route | Aucun guard n'empêche un utilisateur non connecté d'accéder à `/dashboard` ou `/admin`. Implémenter `AuthGuard` et `AdminGuard`. |
| 🔴 Haute | Guard admin | La section `/admin` est accessible sans vérification de rôle. |
| ✅ Fait | Profil utilisateur complet | Formulaire d'édition (nom, email) + changement de mot de passe + avatar coloré. |
| ✅ Fait | Détail réservation | Drawer côté user (`/dashboard/bookings`) : infos complètes + annulation. Drawer côté admin (`/admin/reservations`) : infos + quick actions (confirm / cancel) + lien vers edit. |
| ✅ Fait | Paiements admin | Actions "Mark as paid" et "Refund" sur chaque facture en attente, avec confirm dialog + toast. |
| ✅ Fait | Pagination | `app-pagination` ajouté sur toutes les tables admin et sur `/dashboard/bookings`. |
| 🟢 Basse | Amenities admin | Aucune vue pour gérer les amenities (équipements liés à un espace dans `SpacesService`). |
| 🟢 Basse | Upload photo espace | Le formulaire de création d'espace n'a pas de champ upload de photo. |
| 🟢 Basse | Recherche globale admin | Pas de recherche cross-entités dans l'admin. |

### Composants

| Priorité | Composant | Description |
|----------|-----------|-------------|
| ✅ Fait | `app-pagination` | Composant de pagination générique avec ellipses, page courante et prev/next. |
| ✅ Fait | `app-table` + `app-column` | Table générique avec colonnes configurables (`flex` / `width` / `align`) et cell templates via `ng-template`. Utilisée sur toutes les tables admin + `/dashboard/bookings`. |
| 🔴 Haute | `app-number-input` | Champ numérique avec boutons +/− intégrés (quantité, prix). Actuellement `app-input type="number"` suffit mais manque d'UX. |
| 🟡 Moyenne | `app-badge` | Badge statut / type réutilisable. Actuellement chaque composant a sa propre logique `xxxBadge()`. |
| 🟡 Moyenne | `app-table` | Composant table générique avec colonnes configurables, tri, et ligne vide. Éviterait la duplication des grilles CSS dans chaque vue admin. |
| 🟡 Moyenne | `app-stat-card` | Carte statistique (couleur pastel, label, valeur). Utilisée identiquement dans toutes les vues admin — mérite d'être extraite. |
| 🟡 Moyenne | `app-drawer` | Le pattern drawer (overlay + panel latéral + header + footer) est dupliqué dans 5 composants admin. L'extraire en composant avec `ng-content`. |
| 🟢 Basse | `app-avatar` | Affichage d'initiales stylisé. Actuellement inline dans `users.component.html`. |
| 🟢 Basse | `app-empty-state` | État vide (icône + message) pour les tables. Actuellement un simple `<p>` dans chaque composant. |
| 🟢 Basse | `app-file-upload` | Upload de photos pour les espaces. |

### Technique

| Item | Description |
|------|-------------|
| Intégration API réelle | Tous les services ont un flag `useMock = true`. Brancher les vrais endpoints REST en passant `useMock` à `false`. |
| Gestion d'erreurs HTTP | `ApiService` ne gère pas les erreurs (401, 403, 500). Ajouter un intercepteur HTTP. |
| Refresh token | `AuthService.refreshAccessToken()` existe mais n'est pas appelé automatiquement à l'expiration. |
| Tests | Aucun test unitaire ni e2e présent. |
| Accessibilité | Ajouter `aria-label` sur les boutons icône, vérifier la navigation clavier dans `app-select` et `app-date-picker`. |
