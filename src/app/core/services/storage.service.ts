import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { UserProfile } from '../models/profile.model';
import { MealLog, DailyRecap } from '../models/meal.model';

export interface AppSettings {
  id: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService extends Dexie {
  profile!: Table<UserProfile, number>;
  logs!: Table<MealLog, number>;
  settings!: Table<AppSettings, string>;
  recaps!: Table<DailyRecap, number>;

  constructor() {
    super('NutriSnapDB');
    this.version(1).stores({
      profile: 'id',
      logs: '++id, date, timestamp',
      settings: 'id'
    });
    this.version(2).stores({
      profile: 'id',
      logs: '++id, date, timestamp',
      settings: 'id',
      recaps: '++id, date'
    });
  }


  // Profile Methods
  async getProfile(): Promise<UserProfile | undefined> {
    return await this.profile.get(1);
  }

  async saveProfile(profile: Partial<UserProfile>): Promise<void> {
    const existing = await this.getProfile();
    const updatedProfile = { id: 1, ...existing, ...profile } as UserProfile;
    await this.profile.put(updatedProfile);
  }

  // Logs Methods
  async addMealLog(log: MealLog): Promise<number> {
    return await this.logs.add(log);
  }

  // Normalise les macros des anciens logs (format Gemini prot/carb/fat → proteins/carbs/fats)
  private normalizeMealLog(log: any): MealLog {
    const m = log.macros ?? {};
    if (m.proteins === undefined && m.prot !== undefined) {
      log.macros = { proteins: m.prot ?? 0, carbs: m.carb ?? 0, fats: m.fat ?? 0 };
    }
    return log as MealLog;
  }

  async getLogById(id: number): Promise<MealLog | undefined> {
    const log = await this.logs.get(id);
    return log ? this.normalizeMealLog(log) : undefined;
  }

  async getLogsByDate(date: string): Promise<MealLog[]> {
    const logs = await this.logs.where('date').equals(date).sortBy('timestamp');
    return logs.map(l => this.normalizeMealLog(l));
  }

  async getLogsByMonth(year: number, month: number): Promise<MealLog[]> {
    const pad = (n: number) => String(n).padStart(2, '0');
    const from = `${year}-${pad(month)}-01`;
    const to = `${year}-${pad(month)}-31`;
    const logs = await this.logs.where('date').between(from, to, true, true).toArray();
    return logs.map(l => this.normalizeMealLog(l));
  }

  async deleteLog(id: number): Promise<void> {
    await this.logs.delete(id);
  }

  // Settings Methods
  async getSettings(): Promise<AppSettings | undefined> {
    return await this.settings.get('app');
  }

  async saveSettings(patch: Partial<Omit<AppSettings, 'id'>>): Promise<void> {
    const existing = await this.getSettings();
    const updated: AppSettings = {
      theme: 'system',
      language: 'fr',
      ...existing,
      ...patch,
      id: 'app'
    };
    await this.settings.put(updated);
  }

  // Recaps Methods
  async getRecapByDate(date: string): Promise<DailyRecap | undefined> {
    return await this.recaps.where('date').equals(date).first();
  }

  async saveRecap(recap: Omit<DailyRecap, 'id'>): Promise<number> {
    // Remplace le recap existant pour cette date s'il y en a un
    const existing = await this.getRecapByDate(recap.date);
    if (existing?.id) {
      await this.recaps.update(existing.id, recap);
      return existing.id;
    }
    return await this.recaps.add(recap as DailyRecap);
  }

  async clearAllData(): Promise<void> {
    await this.profile.clear();
    await this.logs.clear();
    await this.settings.clear();
    await this.recaps.clear();
  }
}
