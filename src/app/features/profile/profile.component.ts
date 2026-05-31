import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { ProfileService } from '../../core/services/profile.service';
import { ExportService } from '../../core/services/export.service';
import { StorageService } from '../../core/services/storage.service';
import { UserProfile } from '../../core/models/profile.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatSnackBarModule,
    MatDividerModule,
    MatExpansionModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private exportService = inject(ExportService);
  private storage = inject(StorageService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  profileForm!: FormGroup;
  stats = this.profileService.metabolicStats;
  
  // Advanced fields toggle
  showAdvanced = signal(false);

  ngOnInit() {
    const currentProfile = this.profileService.profile();
    
    this.profileForm = this.fb.group({
      gender: [currentProfile?.gender || 'male', Validators.required],
      age: [currentProfile?.age || 30, [Validators.required, Validators.min(13), Validators.max(120)]],
      weight: [currentProfile?.weight || 70, [Validators.required, Validators.min(30), Validators.max(300)]],
      height: [currentProfile?.height || 170, [Validators.required, Validators.min(100), Validators.max(250)]],
      activityLevel: [currentProfile?.activityLevel || 'moderate', Validators.required],
      goal: [currentProfile?.goal || 'maintain', Validators.required],
      apiKey: [currentProfile?.apiKey || '', Validators.required],
      
      // Advanced optional fields
      bodyFat: [currentProfile?.bodyFat || null],
      subcutaneousFat: [currentProfile?.subcutaneousFat || null],
      visceralFat: [currentProfile?.visceralFat || null],
      muscleMass: [currentProfile?.muscleMass || null],
      measuredBmr: [currentProfile?.measuredBmr || null]
    });

    // React to form changes to update metabolic stats preview in real-time (optional, ProfileService.profile is a signal)
    // But since profileService.profile() is used in the computed metabolicStats, 
    // we might want to update the signal while typing or only on save.
    // For a smoother UX, we update the service signal on form change (debounced)
  }

  async save() {
    if (this.profileForm.invalid) return;
    
    const updatedProfile: UserProfile = {
      ...this.profileForm.value
    };
    
    await this.profileService.updateProfile(updatedProfile);
    this.snackBar.open('Profil mis à jour avec succès !', 'OK', { duration: 3000 });
  }

  async exportData() {
    await this.exportService.exportData();
    this.snackBar.open('Données exportées (JSON)', 'OK', { duration: 3000 });
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const success = await this.exportService.importData(file);
      if (success) {
        await this.profileService.loadProfile();
        this.snackBar.open('Données importées avec succès !', 'OK', { duration: 3000 });
        // Reload page or re-init form
        this.ngOnInit();
      } else {
        this.snackBar.open('Erreur lors de l\'importation', 'Fermer', { duration: 5000 });
      }
    }
  }

  async clearData() {
    if (confirm('Voulez-vous vraiment supprimer TOUTES vos données ? Cette action est irréversible.')) {
      await this.storage.clearAllData();
      await this.profileService.loadProfile();
      this.router.navigate(['/onboarding']);
    }
  }
}
