import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../core/services/profile.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 24px; text-align: center;">
      <h1>Tableau de Bord</h1>
      <p>Bienvenue {{ profileService.profile()?.gender === 'male' ? 'Monsieur' : 'Madame' }} !</p>
      <div style="background: white; padding: 20px; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-top: 20px;">
        <h2>Objectif du jour</h2>
        <p style="font-size: 32px; font-weight: bold; color: #1a5236;">
          {{ profileService.metabolicStats()?.dailyCalorieTarget | number:'1.0-0' }} kcal
        </p>
        <p>Métabolisme de base : {{ profileService.metabolicStats()?.bmr | number:'1.0-0' }} kcal</p>
      </div>
      <p style="margin-top: 40px; color: #666; font-style: italic;">Le moteur de scan arrive au module 3...</p>
    </div>
  `
})
export class DashboardComponent {
  profileService = inject(ProfileService);
}
