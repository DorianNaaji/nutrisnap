import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'ns-card',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card [class.variant-card]="variant === 'surface-variant'" [ngClass]="customClass">
      @if (title) {
        <mat-card-header>
          <mat-card-title>{{ title }}</mat-card-title>
          @if (subtitle) {
            <mat-card-subtitle>{{ subtitle }}</mat-card-subtitle>
          }
        </mat-card-header>
      }
      <mat-card-content [style.padding]="padding">
        <ng-content></ng-content>
      </mat-card-content>
      <ng-content select="[card-footer]"></ng-content>
    </mat-card>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    mat-card-header { padding: 1.5rem 1.5rem 0.5rem 1.5rem; }
    mat-card-title { font-size: 1.1rem; font-weight: 600; color: var(--md-sys-color-on-surface); }
    mat-card-subtitle { font-size: 0.85rem; color: var(--md-sys-color-on-surface-variant); }
  `]
})
export class NsCardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() variant: 'surface' | 'surface-variant' = 'surface';
  @Input() padding: string = '1.5rem';
  @Input() customClass: string = '';
}
