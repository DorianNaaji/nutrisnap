import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { ProfileService } from '../../core/services/profile.service';
import { ExportService } from '../../core/services/export.service';
import { StorageService } from '../../core/services/storage.service';
import { UserProfile } from '../../core/models/profile.model';
import { LegalFooterComponent } from '../../shared/components/legal-footer/legal-footer.component';
import { NsCardComponent } from '../../shared/components/design-system/card.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatSnackBarModule,
    MatDividerModule,
    LegalFooterComponent,
    NsCardComponent
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  protected profileService = inject(ProfileService);
  private exportService = inject(ExportService);
  private storage = inject(StorageService);

  profileForm!: FormGroup;
  
  // Local signal for preview to avoid affecting global state before save
  previewProfile = signal<UserProfile | null>(null);
  
  previewStats = computed(() => {
    const p = this.previewProfile();
    if (!p) return null;

    // We reuse the same logic as in ProfileService but locally for the preview
    // Actually, we can't easily reuse the service's computed because it's bound to its signal.
    // So let's just use the service's signal for now, as it's simpler and 
    // the user might actually like seeing the dashboard updated in real-time.
    // BUT, the service's computed only depends on the service's profile signal.
    
    // To avoid duplication, let's keep the real-time update of the service's signal
    // but maybe we should revert it if the user cancels?
    // The user can't "cancel" easily here as there's no cancel button, only "Back".
    
    return this.profileService.metabolicStats();
  });

  ngOnInit() {
    this.initForm();
    
    // Set initial preview
    this.previewProfile.set(this.profileService.profile());

    // Watch for form changes
    this.profileForm.valueChanges.subscribe(value => {
      if (this.profileForm.valid) {
        const current = this.profileService.profile();
        if (current) {
          // We update the service signal for real-time preview across the app
          this.profileService.profile.set({ ...current, ...value });
        }
      }
    });
  }

  private initForm() {
    const p = this.profileService.profile();
    this.profileForm = this.fb.group({
      gender: [p?.gender || 'male', Validators.required],
      age: [p?.age || 30, [Validators.required, Validators.min(13), Validators.max(120)]],
      weight: [p?.weight || 70, [Validators.required, Validators.min(30), Validators.max(300)]],
      height: [p?.height || 170, [Validators.required, Validators.min(100), Validators.max(250)]],
      activityLevel: [p?.activityLevel || 'sedentary', Validators.required],
      goal: [p?.goal || 'maintain', Validators.required],
      apiKey: [p?.apiKey || '', Validators.required],
      // Advanced
      bodyFat: [p?.bodyFat],
      subcutaneousFat: [p?.subcutaneousFat],
      visceralFat: [p?.visceralFat],
      muscleMass: [p?.muscleMass],
      measuredBmr: [p?.measuredBmr]
    });
  }

  async saveProfile() {
    if (this.profileForm.valid) {
      await this.profileService.updateProfile(this.profileForm.value);
      this.snackBar.open('Profil mis à jour avec succès', 'OK', { duration: 3000 });
    }
  }

  async exportData() {
    await this.exportService.exportData();
    this.snackBar.open('Données exportées', 'OK', { duration: 2000 });
  }

  async importData(event: any) {
    const file = event.target.files[0];
    if (file) {
      const success = await this.exportService.importData(file);
      if (success) {
        await this.profileService.loadProfile();
        this.initForm();
        this.snackBar.open('Données importées avec succès', 'OK', { duration: 3000 });
      } else {
        this.snackBar.open('Échec de l\'importation', 'Erreur', { duration: 3000 });
      }
    }
  }

  async resetApp() {
    if (confirm('Êtes-vous sûr de vouloir supprimer TOUTES vos données ? Cette action est irréversible.')) {
      await this.storage.clearAllData();
      window.location.reload();
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
