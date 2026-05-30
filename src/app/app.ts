import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DevResetComponent } from './shared/components/dev-reset/dev-reset.component';
import { environment } from '../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DevResetComponent, CommonModule],
  template: `
    <router-outlet />
    <app-dev-reset *ngIf="!isProd" />
  `,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('nutrisnap');
  isProd = environment.production;
}
