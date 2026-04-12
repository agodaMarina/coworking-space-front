import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomePageComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register.component').then((m) => m.RegisterPageComponent),
   },
//   {
//     path: 'profile',
//     loadComponent: () => import('./features/auth/profile.component').then((m) => m.ProfilePageComponent),
//     canActivate: [authGuard],
//   },
  {
    path: 'spaces',
    loadComponent: () => import('./features/spaces/space-list.component').then((m) => m.SpaceListPageComponent),
  },
  {
    path: 'spaces/:id',
    loadComponent: () => import('./features/spaces/space-detail.component').then((m) => m.SpaceDetailPageComponent),
  },
//   {
//     path: 'booking',
//     loadComponent: () => import('./features/booking/booking.component').then((m) => m.BookingPageComponent),
//     canActivate: [authGuard],
//   },
{
    path:'booking',
    loadComponent: () => import('./features/booking/booking.component').then((m) => m.BookingPageComponent),
    canActivate: [authGuard],
},
  { path: '**', redirectTo: 'home' },
];
