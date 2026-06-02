import { Injectable, signal, computed, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { MealLog, DailyStats } from '../models/meal.model';
import { ProfileService } from './profile.service';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private storage = inject(StorageService);
  private profileService = inject(ProfileService);

  // Today's logs
  dailyLogs = signal<MealLog[]>([]);

  // Daily stats reactive calculation
  dailyStats = computed<DailyStats>(() => {
    const logs = this.dailyLogs();
    const metabolicStats = this.profileService.metabolicStats();
    
    // Fallback to 0 if target not yet calculated, avoid hardcoding 2000
    const target = metabolicStats?.dailyCalorieTarget || 0;

    const totals = logs.reduce((acc, log) => ({
      calories: acc.calories + log.calories,
      proteins: acc.proteins + log.macros.proteins,
      carbs: acc.carbs + log.macros.carbs,
      fats: acc.fats + log.macros.fats
    }), { calories: 0, proteins: 0, carbs: 0, fats: 0 });

    return {
      totalCalories: Math.round(totals.calories * 10) / 10,
      totalProteins: Math.round(totals.proteins * 10) / 10,
      totalCarbs: Math.round(totals.carbs * 10) / 10,
      totalFats: Math.round(totals.fats * 10) / 10,
      remainingCalories: Math.round((target - totals.calories) * 10) / 10
    };
  });

  constructor() {
    this.loadTodayLogs();
  }

  async loadTodayLogs() {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const logs = await this.storage.getLogsByDate(today);
    this.dailyLogs.set(logs);
  }

  async addLog(log: MealLog) {
    await this.storage.addMealLog(log);
    await this.loadTodayLogs();
  }

  async deleteLog(id: number) {
    await this.storage.deleteLog(id);
    await this.loadTodayLogs();
  }
}
