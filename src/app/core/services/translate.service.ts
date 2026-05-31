import { Injectable, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';

export type Lang = 'fr' | 'en';

@Injectable({ providedIn: 'root' })
export class TranslateService {
  private storage = inject(StorageService);
  private translations = signal<Record<string, any>>({});
  currentLang = signal<Lang>('fr');

  async init() {
    const settings = await this.storage.getSettings();
    const lang = (settings?.language as Lang) ?? 'fr';
    await this.loadLang(lang);
  }

  async setLang(lang: Lang) {
    await this.storage.saveSettings({ language: lang });
    await this.loadLang(lang);
  }

  private async loadLang(lang: Lang) {
    const res = await fetch(`assets/i18n/${lang}.json`);
    const data = await res.json();
    this.translations.set(data);
    this.currentLang.set(lang);
  }

  t(key: string, params?: Record<string, string | number>): string {
    // Trigger signal dependency so impure pipe re-evaluates on language change
    const data = this.translations();
    const keys = key.split('.');
    let value: any = data;
    for (const k of keys) value = value?.[k];
    if (typeof value !== 'string') return key;
    if (!params) return value;
    return Object.entries(params).reduce(
      (s, [k, v]) => s.replace(`{{${k}}}`, String(v)), value
    );
  }

  arr(key: string): string[] {
    const data = this.translations();
    const keys = key.split('.');
    let value: any = data;
    for (const k of keys) value = value?.[k];
    return Array.isArray(value) ? value : [];
  }
}
