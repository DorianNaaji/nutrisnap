import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { UserProfile } from '../models/profile.model';
import { MealLog } from '../models/meal.model';

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

  constructor() {
    super('NutriSnapDB');
    this.version(1).stores({
      profile: 'id',
      logs: '++id, date, timestamp',
      settings: 'id'
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

  async getLogById(id: number): Promise<MealLog | undefined> {
    return await this.logs.get(id);
  }

  async getLogsByDate(date: string): Promise<MealLog[]> {
    return await this.logs.where('date').equals(date).sortBy('timestamp');
  }

  async getLogsByMonth(year: number, month: number): Promise<MealLog[]> {
    const pad = (n: number) => String(n).padStart(2, '0');
    const from = `${year}-${pad(month)}-01`;
    const to = `${year}-${pad(month)}-31`;
    return await this.logs.where('date').between(from, to, true, true).toArray();
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

  async clearAllData(): Promise<void> {
    await this.profile.clear();
    await this.logs.clear();
    await this.settings.clear();
  }
}
