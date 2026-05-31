import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private storage = inject(StorageService);

  private _currentTheme = signal<'light' | 'dark' | 'system'>('system');
  private _systemDark = signal<boolean>(false);

  readonly currentTheme = this._currentTheme.asReadonly();

  readonly resolvedTheme = computed<'light' | 'dark'>(() => {
    const t = this._currentTheme();
    return t === 'system' ? (this._systemDark() ? 'dark' : 'light') : t;
  });

  constructor() {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    this._systemDark.set(mq.matches);
    mq.addEventListener('change', (e) => this._systemDark.set(e.matches));

    effect(() => {
      document.documentElement.setAttribute('data-theme', this.resolvedTheme());
    });
  }

  async init(): Promise<void> {
    const settings = await this.storage.getSettings();
    this._currentTheme.set(settings?.theme ?? 'system');
  }

  async setTheme(theme: 'light' | 'dark' | 'system'): Promise<void> {
    this._currentTheme.set(theme);
    await this.storage.saveSettings({ theme });
  }
}
