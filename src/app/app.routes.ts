import { Routes } from '@angular/router';
import { interviewExitGuard } from './guards/interview-exit-guard';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing/landing').then(m => m.Landing)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then(m => m.Dashboard)
  },
  {
    path: 'my-interviews',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/my-interviews/my-interviews').then(m => m.MyInterviews)
  },
  {
    path: 'interview-setup',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/interview-setup/interview-setup').then(m => m.InterviewSetup)
  },
  {
    path: 'interview/:id',
    canActivate: [authGuard],
    canDeactivate: [interviewExitGuard],
    loadComponent: () =>
      import('./pages/interview/interview').then(m => m.Interview)
  },
  {
    path: 'results/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/interview-results/interview-results').then((m) => m.InterviewResults),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/profile/profile').then(m => m.Profile)
  },
];