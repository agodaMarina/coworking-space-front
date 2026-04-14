# Coworking Space Booking Platform

A modern Angular frontend application for managing coworking space reservations, built with Angular 21 and PrimeNG.

## Overview

This frontend application connects to a Django REST API backend to provide a complete coworking space management solution. Users can browse available workspaces, view detailed space information, and make reservations with flexible billing options.

## Tech Stack

- **Framework**: Angular 21 (standalone components)
- **UI Library**: PrimeNG 21
- **Styling**: Tailwind CSS 4
- **HTTP Client**: RxJS with Angular HttpClient
- **Authentication**: JWT (JSON Web Tokens)
- **Testing**: Vitest

## Features

### Authentication

- User registration and login
- JWT token-based authentication
- Auto token refresh
- Protected routes with guards
- Session persistence in localStorage

### Spaces

- Browse all coworking spaces
- Filter by space type (Desk, Open Space, Meeting Room, Private Office, Conference Room)
- Filter by capacity (range slider)
- View detailed space information in modal dialog
- Amenities display (Wi-Fi, Video Conference, Projector, etc.)

### Booking System

- Multi-step booking form
- Space selection
- Date range picker
- Billing types: Hourly, Daily, Monthly
- Time selection for hourly bookings
- Recurring booking options (Daily, Weekly, Biweekly, Monthly)
- Special requests/notes
- Real-time price calculation
- Booking summary display

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── auth.service.ts        # Authentication service
│   │   ├── auth.guard.ts          # Route protection
│   │   ├── auth.interceptor.ts    # JWT token interceptor
│   │   ├── api.service.ts         # Base API service
│   │   ├── primeng.config.ts      # PrimeNG configuration
│   │   └── services/
│   │       ├── spaces.service.ts      # Spaces API
│   │       ├── reservations.service.ts # Reservations API
│   │       └── toast.service.ts       # Toast notifications
│   ├── features/
│   │   ├── home/                  # Landing page with carousel
│   │   ├── auth/                  # Login, Register, Profile
│   │   ├── spaces/                # Space list & detail pages
│   │   └── booking/               # Booking form page
│   ├── shared/
│   │   └── components/
│   │       ├── header/           # Navigation header
│   │       ├── footer/           # Site footer
│   │       └── toast-container/   # Toast notifications container
│   ├── app.routes.ts             # Application routes
│   ├── app.config.ts             # App configuration
│   └── app.ts                    # Root component
├── styles.css                    # Global styles
└── index.html                    # HTML entry point
```

## API Endpoints

The application expects the following backend API endpoints:

### Authentication

- `POST /api/auth/login/` - User login
- `POST /api/auth/register/` - User registration
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/token/refresh/` - Refresh JWT token
- `GET /api/auth/profile/` - Get user profile

### Spaces

- `GET /api/spaces/` - List all spaces
- `GET /api/spaces/available/` - List available spaces
- `GET /api/spaces/{id}/` - Get space details
- `GET /api/spaces/amenities/` - List all amenities

### Reservations

- `POST /api/reservations/` - Create new reservation
- `GET /api/reservations/` - List user reservations
- `GET /api/reservations/{id}/` - Get reservation details
- `PATCH /api/reservations/{id}/` - Update reservation
- `DELETE /api/reservations/{id}/` - Cancel reservation

## Routes

| Path          | Component                | Auth Required |
| ------------- | ------------------------ | ------------- |
| `/home`       | HomePageComponent        | No            |
| `/login`      | LoginPageComponent       | No            |
| `/register`   | RegisterPageComponent    | No            |
| `/spaces`     | SpaceListPageComponent   | No            |
| `/spaces/:id` | SpaceDetailPageComponent | No            |
| `/booking`    | BookingPageComponent     | Yes           |

## Development

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Development Server

```bash
npm start
```

Navigate to `http://localhost:4200/`. The app will automatically reload on file changes.

### Build

```bash
npm run build
```

Build artifacts are stored in the `dist/` directory.

### Mock Mode

Services include a `useMocks` signal to toggle between mock data and real API calls. This is useful for development without a backend:

```typescript
spacesService.toggleMocks();
authService.toggleMocks();
```

## Environment Configuration

Configure your API base URL in the API service or environment files as needed.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
