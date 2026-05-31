import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  template: `
    <router-outlet />
  `,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('nutrisnap');
}
