import { Routes } from '@angular/router';
import { OnboardingComponent } from './features/onboarding/onboarding.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ScannerComponent } from './features/scanner/scanner.component';
import { onboardingGuard } from './core/guards/onboarding-guard';
import { profileExistsGuard } from './core/guards/profile-exists-guard';

export const routes: Routes = [
  { path: 'onboarding', component: OnboardingComponent, canActivate: [profileExistsGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [onboardingGuard] },
  { path: 'scanner', component: ScannerComponent, canActivate: [onboardingGuard] },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [onboardingGuard]
  },
  {
    path: 'meal/:id',
    loadComponent: () => import('./features/meal-detail/meal-detail.component').then(m => m.MealDetailComponent),
    canActivate: [onboardingGuard]
  },
  {
    path: 'history',
    loadComponent: () => import('./features/history/history.component').then(m => m.HistoryComponent),
    canActivate: [onboardingGuard]
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
