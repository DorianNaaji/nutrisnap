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

    // Mifflin-St Jeor Equation or measured BMR
    let bmr = p.measuredBmr || (10 * p.weight + 6.25 * p.height - 5 * p.age);
    if (!p.measuredBmr) {
      bmr = p.gender === 'male' ? bmr + 5 : bmr - 161;
    }

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

    const dailyCalorieTargetRaw = tdee + goalAdjustments[p.goal];
    
    // Safety Floor: Never go below BMR to avoid metabolic damage, and absolute floor of 1200
    const dailyCalorieTarget = Math.max(1200, bmr, dailyCalorieTargetRaw);
    const isSafetyFloorHit = dailyCalorieTarget > dailyCalorieTargetRaw;

    // Macro Targets (Standard 40/30/30 or similar safe split)
    // Using Prots: 25%, Fats: 30%, Carbs: 45%
    const targets = {
      proteins: Math.round((dailyCalorieTarget * 0.25) / 4),
      carbs: Math.round((dailyCalorieTarget * 0.45) / 4),
      fats: Math.round((dailyCalorieTarget * 0.30) / 9)
    };

    return { bmr, tdee, dailyCalorieTarget, isSafetyFloorHit, targets };
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
