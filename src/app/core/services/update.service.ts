import { Injectable, inject } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter } from 'rxjs/operators';
import { interval } from 'rxjs';

const POLL_INTERVAL_MS = 5 * 60 * 1000; // vérification toutes les 5 minutes

@Injectable({ providedIn: 'root' })
export class UpdateService {
  private swUpdate = inject(SwUpdate);
  private snackBar = inject(MatSnackBar);

  init() {
    if (!this.swUpdate.isEnabled) return;

    this.swUpdate.versionUpdates
      .pipe(filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'))
      .subscribe(() => {
        const snack = this.snackBar.open(
          'Nouvelle version disponible',
          'Mettre à jour',
          { duration: 0, horizontalPosition: 'center', verticalPosition: 'bottom' }
        );
        snack.onAction().subscribe(() => {
          this.swUpdate.activateUpdate().then(() => document.location.reload());
        });
      });

    // Vérifie une mise à jour toutes les 5 minutes sans attendre une navigation
    interval(POLL_INTERVAL_MS).subscribe(() => this.swUpdate.checkForUpdate());
  }
}
