import { Component, Inject, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslateService } from '../../core/services/translate.service';

@Component({
  selector: 'app-delete-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, TranslatePipe],
  template: `
    <h2 mat-dialog-title>{{ 'meal_detail.dialog_title' | t }}</h2>
    <mat-dialog-content>
      <p>{{ translate.t('meal_detail.dialog_body', { name: data.name }) }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close(false)">{{ 'common.cancel' | t }}</button>
      <button mat-flat-button color="warn" (click)="ref.close(true)">{{ 'meal_detail.dialog_confirm' | t }}</button>
    </mat-dialog-actions>
  `
})
export class DeleteConfirmDialogComponent {
  translate = inject(TranslateService);
  constructor(
    public ref: MatDialogRef<DeleteConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { name: string }
  ) {}
}
