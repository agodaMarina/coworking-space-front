# Coworking Front-End Documentation

## Contexte
Projet Angular de réservation d'espaces coworking, connecté à un backend Django local.

## Progression

### Étape 1 — Structure initiale
- Création de l'architecture feature-based : `core`, `shared`, `features/auth`, `features/home`, `features/spaces`, `features/booking`, `features/payments`, `features/notifications`.
- Mise en place du routage lazy-loaded dans `src/app/app.routes.ts`.
- Ajout de `provideHttpClient` et d'un `AuthInterceptor` dans `src/app/app.config.ts`.
- Mise en place du shell global avec `router-outlet`.
- Création des composants de base : header, footer, page d'accueil, listes d'espaces, détails d'espace, page de réservation.
- Build Angular validé.

### Étape 2 — Authentification
- Intégration de l'API d'authentification Django : `/api/auth/login/`, `/api/auth/register/`, `/api/auth/logout/`, `/api/auth/token/refresh/`, `/api/auth/profile/`.
- Implémentation de `AuthService` avec `access` et `refresh` tokens.
- Stockage sécurisé en localStorage pour `access`, `refresh` et `user`.
- Création d'un composant `app-header` avec navigation conditionnelle et déconnexion.
- Ajout d'une page de profil protégée par `AuthGuard`.
- Build Angular validé après modifications.

## Backend connecté
Le backend Django local se situe dans : `/home/marina/Téléchargements/PROJET DJANGO`

## Prochaines étapes
1. Ajouter l'intégration des disponibilités et du flux de réservation réel.
2. Compléter les pages `spaces` et `booking` avec les APIs `spaces` et `reservations`.
3. Déployer la logique de paiement et notifications.
4. Ajouter tests unitaires pour l'authentification et le booking.
