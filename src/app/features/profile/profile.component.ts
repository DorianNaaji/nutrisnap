import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
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

  personalForm!: FormGroup;
  advancedForm!: FormGroup;
  showApiKey = signal(false);
  
  // Local signal for preview to avoid affecting global state before save
  previewProfile = signal<UserProfile | null>(null);
  
  previewStats = computed(() => {
    return this.profileService.metabolicStats();
  });

  constructor() {
    effect(() => {
      const p = this.profileService.profile();
      if (p) {
        this.updateForms(p);
      }
    });
  }

  ngOnInit() {
    this.initForms(); // Setup structure
    
    // Set initial preview
    this.previewProfile.set(this.profileService.profile());

    // Watch for form changes to update preview (only for personal/advanced)
    this.personalForm.valueChanges.subscribe(value => this.updatePreview(value));
    this.advancedForm.valueChanges.subscribe(value => this.updatePreview(value));
  }

  private updatePreview(value: any) {
    const current = this.profileService.profile();
    if (current) {
      this.profileService.profile.set({ ...current, ...value });
    }
  }

  private updateForms(p: UserProfile) {
    this.personalForm.patchValue(p, { emitEvent: false });
    this.advancedForm.patchValue(p, { emitEvent: false });
  }

  private initForms() {
    // Only define structure here
    this.personalForm = this.fb.group({
      gender: ['male', Validators.required],
      age: [30, [Validators.required, Validators.min(13), Validators.max(120)]],
      weight: [70, [Validators.required, Validators.min(30), Validators.max(300)]],
      height: [170, [Validators.required, Validators.min(100), Validators.max(250)]],
      activityLevel: ['sedentary', Validators.required],
      goal: ['maintain', Validators.required],
    });

    this.advancedForm = this.fb.group({
      bodyFat: [null],
      subcutaneousFat: [null],
      visceralFat: [null],
      muscleMass: [null],
      measuredBmr: [null]
    });
  }

  async savePersonal() {
    if (this.personalForm.valid) {
      await this.profileService.updateProfile(this.personalForm.value as Partial<UserProfile>);
      this.snackBar.open('Informations mises à jour', 'OK', { duration: 3000 });
    }
  }

  async saveAdvanced() {
    if (this.advancedForm.valid) {
      await this.profileService.updateProfile(this.advancedForm.value as Partial<UserProfile>);
      this.snackBar.open('Données avancées mises à jour', 'OK', { duration: 3000 });
    }
  }

  async saveApiKey(key: string) {
    await this.profileService.updateProfile({ apiKey: key } as Partial<UserProfile>);
    this.snackBar.open('Clé API sauvegardée', 'OK', { duration: 3000 });
    this.showApiKey.set(false);
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
        // The effect will handle form update via initForms/updateForms
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
