import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      {
        path: 'overview',
        loadComponent: () => import('./features/dashboard/overview/overview.component').then(m => m.OverviewComponent),
      },
      {
        path: 'bookings',
        loadComponent: () => import('./features/dashboard/bookings/bookings.component').then(m => m.BookingsComponent),
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/dashboard/profile/profile.component').then(m => m.ProfileComponent),
      },
      {
        path: 'spaces',
        loadComponent: () => import('./features/dashboard/spaces/spaces.component').then(m => m.DashboardSpacesComponent),
      },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'home',
    loadComponent: () => import('./features/web-site/home/home.component').then((m) => m.HomePageComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterPageComponent),
   },
//   {
//     path: 'profile',
//     loadComponent: () => import('./features/auth/profile.component').then((m) => m.ProfilePageComponent),
//     canActivate: [authGuard],
//   },
  {
    path: 'spaces',
    loadComponent: () => import('./features/web-site/spaces/space-list.component').then((m) => m.SpaceListPageComponent),
  },
  {
    path: 'spaces/:id',
    loadComponent: () => import('./features/web-site/spaces/space-detail/space-detail.component').then((m) => m.SpaceDetailPageComponent),
  },
//   {
//     path: 'booking',
//     loadComponent: () => import('./features/booking/booking.component').then((m) => m.BookingPageComponent),
//     canActivate: [authGuard],
//   },
{
  path:'booking',
  loadComponent: () => import('./features/web-site/booking/booking.component').then((m) => m.BookingPageComponent),
},
  { path: '**', redirectTo: 'home' },
];
