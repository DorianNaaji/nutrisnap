import { Injectable, signal, computed, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { MealLog, DailyStats, WeeklyStats } from '../models/meal.model';
import { ProfileService } from './profile.service';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private storage = inject(StorageService);
  private profileService = inject(ProfileService);

  // Today's logs
  dailyLogs = signal<MealLog[]>([]);

  // Logs of the current week (Monday -> Sunday)
  weeklyLogs = signal<MealLog[]>([]);
  weekStart = signal<Date>(new Date());
  weekEnd = signal<Date>(new Date());

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

  // Weekly stats reactive calculation
  weeklyStats = computed<WeeklyStats>(() => {
    const logs = this.weeklyLogs();
    const dailyTarget = this.profileService.metabolicStats()?.dailyCalorieTarget || 0;
    const target = dailyTarget * 7;

    const total = logs.reduce((acc, log) => acc + log.calories, 0);

    return {
      totalCalories: Math.round(total),
      targetCalories: Math.round(target),
      progress: target > 0 ? Math.min(100, (total / target) * 100) : 0,
      isSurplus: target > 0 && total > target
    };
  });

  constructor() {
    this.loadTodayLogs();
    this.loadWeekLogs();
  }

  private toDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // Monday of the week containing `from` (getDay() returns 0 for Sunday)
  private mondayOf(from: Date): Date {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    const offset = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - offset);
    return d;
  }

  async loadTodayLogs() {
    const today = this.toDateStr(new Date());
    const logs = await this.storage.getLogsByDate(today);
    this.dailyLogs.set(logs);
  }

  async loadWeekLogs() {
    const start = this.mondayOf(new Date());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    this.weekStart.set(start);
    this.weekEnd.set(end);

    const logs = await this.storage.getLogsByDateRange(this.toDateStr(start), this.toDateStr(end));
    this.weeklyLogs.set(logs);
  }

  private async reload() {
    await Promise.all([this.loadTodayLogs(), this.loadWeekLogs()]);
  }

  async addLog(log: MealLog) {
    await this.storage.addMealLog(log);
    await this.reload();
  }

  async deleteLog(id: number) {
    await this.storage.deleteLog(id);
    await this.reload();
  }
}
