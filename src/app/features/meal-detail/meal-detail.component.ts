import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NsCardComponent } from '../../shared/components/design-system/card.component';
import { StorageService } from '../../core/services/storage.service';
import { LogService } from '../../core/services/log.service';
import { MealLog } from '../../core/models/meal.model';
import { DeleteConfirmDialogComponent } from './delete-confirm-dialog.component';

@Component({
  selector: 'app-meal-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatDialogModule, MatSnackBarModule,
    NsCardComponent
  ],
  templateUrl: './meal-detail.component.html',
  styleUrls: ['./meal-detail.component.css']
})
export class MealDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private storage = inject(StorageService);
  private logService = inject(LogService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  meal = signal<MealLog | null>(null);
  imageUrl = signal<string | null>(null);
  isLoading = signal(true);
  notFound = signal(false);

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(id)) { this.notFound.set(true); this.isLoading.set(false); return; }

    const log = await this.storage.getLogById(id);
    if (!log) { this.notFound.set(true); this.isLoading.set(false); return; }

    this.meal.set(log);

    if (log.imageBlob) {
      this.imageUrl.set(URL.createObjectURL(log.imageBlob));
    }

    this.isLoading.set(false);
  }

  goBack() {
    this.location.back();
  }

  confidenceLabel(c: string): string {
    return c === 'high' ? 'Haute' : c === 'medium' ? 'Moyenne' : 'Faible';
  }

  openDeleteDialog() {
    const ref = this.dialog.open(DeleteConfirmDialogComponent, {
      width: '320px',
      data: { name: this.meal()?.foodName }
    });
    ref.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        await this.logService.deleteLog(this.meal()!.id!);
        this.snackBar.open('Repas supprimé', 'OK', { duration: 2500 });
        this.router.navigate(['/dashboard']);
      }
    });
  }
}
