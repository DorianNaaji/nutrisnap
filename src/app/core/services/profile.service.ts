import { Injectable, computed, signal } from '@angular/core';
import { UserProfile, MetabolicStats } from '../models/profile.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  profile = signal<UserProfile | null>(null);

  metabolicStats = computed<MetabolicStats | null>(() => {
    const p = this.profile();
    if (!p) return null;

    // Mifflin-St Jeor Equation
    let bmr = 10 * p.weight + 6.25 * p.height - 5 * p.age;
    bmr = p.gender === 'male' ? bmr + 5 : bmr - 161;

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    const tdee = bmr * activityMultipliers[p.activityLevel];

    const goalAdjustments = {
      lose_mild: -300,
      lose_moderate: -500,
      lose_aggressive: -750,
      maintain: 0,
      gain: 300
    };

    const dailyCalorieTarget = Math.max(1200, tdee + goalAdjustments[p.goal]);

    return { bmr, tdee, dailyCalorieTarget };
  });

  constructor(private storage: StorageService) {
    this.loadProfile();
  }

  private async loadProfile() {
    const p = await this.storage.getProfile();
    if (p) {
      this.profile.set(p);
    }
  }

  async updateProfile(p: UserProfile) {
    this.profile.set(p);
    await this.storage.saveProfile(p);
  }

  isConfigured() {
    return computed(() => !!this.profile()?.apiKey);
  }
}
