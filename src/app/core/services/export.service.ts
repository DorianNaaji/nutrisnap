import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private storage = inject(StorageService);

  async exportData() {
    const profile = await this.storage.profile.toArray();
    const logs = await this.storage.logs.toArray();
    const settings = await this.storage.settings.toArray();

    const data = {
      version: 1,
      exportDate: new Date().toISOString(),
      profile,
      logs,
      settings
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nutrisnap-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  async importData(file: File): Promise<boolean> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.profile || !data.logs) throw new Error('Invalid format');

      await this.storage.transaction('rw', this.storage.profile, this.storage.logs, this.storage.settings, async () => {
        await this.storage.profile.clear();
        await this.storage.logs.clear();
        await this.storage.settings.clear();

        if (data.profile.length > 0) await this.storage.profile.bulkAdd(data.profile);
        if (data.logs.length > 0) await this.storage.logs.bulkAdd(data.logs);
        if (data.settings?.length > 0) await this.storage.settings.bulkAdd(data.settings);
      });

      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }
}
