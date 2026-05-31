import { APP_INITIALIZER, ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { provideServiceWorker } from '@angular/service-worker';
import { isDevMode } from '@angular/core';
import { ThemeService } from './core/services/theme.service';
import { UpdateService } from './core/services/update.service';
import { TranslateService } from './core/services/translate.service';

import { routes } from './app.routes';

registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(),
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: (theme: ThemeService) => () => theme.init(),
      deps: [ThemeService],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (update: UpdateService) => () => update.init(),
      deps: [UpdateService],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (translate: TranslateService) => () => translate.init(),
      deps: [TranslateService],
      multi: true
    }
  ]
};
