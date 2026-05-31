import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';

export interface RecapSheetData {
  title: string;
  subtitle?: string;
  text: string;
}

@Component({
  selector: 'app-recap-sheet',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="recap-sheet">
      <div class="recap-header">
        <div class="recap-titles">
          <h3 class="recap-title">{{ data.title }}</h3>
          <p *ngIf="data.subtitle" class="recap-subtitle">{{ data.subtitle }}</p>
        </div>
        <button mat-icon-button (click)="close()" class="close-btn" aria-label="Fermer">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      <div class="recap-body">
        <mat-icon class="recap-icon">auto_awesome</mat-icon>
        <p class="recap-text">{{ data.text }}</p>
      </div>
    </div>
  `,
  styles: [`
    .recap-sheet {
      padding: 1rem 1.25rem 2rem;
      max-height: 70vh;
      overflow-y: auto;
    }
    .recap-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 1rem;
    }
    .recap-titles { flex: 1; }
    .recap-title {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
      color: var(--primary);
    }
    .recap-subtitle {
      margin: 0.25rem 0 0;
      font-size: 0.75rem;
      color: var(--md-sys-color-on-surface-variant);
    }
    .close-btn { margin-top: -0.5rem; }
    .recap-body {
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
      background: var(--surface-variant);
      border-radius: var(--radius-lg);
      padding: 1rem;
    }
    .recap-icon {
      color: var(--primary);
      flex-shrink: 0;
      margin-top: 2px;
    }
    .recap-text {
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.65;
      color: var(--md-sys-color-on-surface);
      white-space: pre-wrap;
    }
  `]
})
export class RecapSheetComponent {
  data = inject<RecapSheetData>(MAT_BOTTOM_SHEET_DATA);
  private sheetRef = inject(MatBottomSheetRef<RecapSheetComponent>);

  close() { this.sheetRef.dismiss(); }
}
