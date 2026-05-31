import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Supprimer ce repas ?</h2>
    <mat-dialog-content>
      <p>{{ data.name }} sera définitivement supprimé de votre historique.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close(false)">Annuler</button>
      <button mat-flat-button color="warn" (click)="ref.close(true)">Supprimer</button>
    </mat-dialog-actions>
  `
})
export class DeleteConfirmDialogComponent {
  constructor(
    public ref: MatDialogRef<DeleteConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { name: string }
  ) {}
}
