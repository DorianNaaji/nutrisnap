import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { UserProfile } from '../models/profile.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService extends Dexie {
  profile!: Table<UserProfile, number>;
  logs!: Table<any, number>;

  constructor() {
    super('NutriSnapDB');
    this.version(1).stores({
      profile: '++id',
      logs: '++id, date'
    });
  }

  async getProfile(): Promise<UserProfile | undefined> {
    const profiles = await this.profile.toArray();
    return profiles[0];
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    const existing = await this.profile.toArray();
    if (existing.length > 0) {
      await this.profile.update(existing[0].id as any, profile);
    } else {
      await this.profile.add(profile);
    }
  }
}
