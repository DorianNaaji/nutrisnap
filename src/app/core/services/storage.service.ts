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

  async getLogsByDate(date: string): Promise<MealLog[]> {
    return await this.logs.where('date').equals(date).sortBy('timestamp');
  }

  async deleteLog(id: number): Promise<void> {
    await this.logs.delete(id);
  }

  async clearAllData(): Promise<void> {
    await this.profile.clear();
    await this.logs.clear();
    await this.settings.clear();
  }
}
