import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StorageService } from '../../../core/services/storage.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-dev-reset',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <button mat-mini-fab color="warn" (click)="resetApp()" class="reset-fab" title="Reset Data">
      <mat-icon>delete_forever</mat-icon>
    </button>
  `,
  styles: [`
    .reset-fab {
      position: fixed;
      bottom: 80px;
      left: 16px;
      z-index: 1000;
    }
  `]
})
export class DevResetComponent {
  isDev = !environment.production;
  private storage = inject(StorageService);

  async resetApp() {
    if (confirm('Voulez-vous vraiment supprimer toutes vos données (profil + historique) et recommencer ?')) {
      await this.storage.clearAllData();
      window.location.reload();
    }
  }
}
