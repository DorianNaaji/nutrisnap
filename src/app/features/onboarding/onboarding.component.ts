import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { ProfileService } from '../../core/services/profile.service';
import { StorageService } from '../../core/services/storage.service';
import { GeminiService } from '../../core/services/gemini.service';
import { LegalFooterComponent } from '../../shared/components/legal-footer/legal-footer.component';
import { Router } from '@angular/router';
import { UserProfile } from '../../core/models/profile.model';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    LegalFooterComponent
  ],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css']
})
export class OnboardingComponent {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private geminiService = inject(GeminiService);
  private router = inject(Router);
  private storage = inject(StorageService);

  metabolismForm: FormGroup;
  goalForm: FormGroup;
  apiForm: FormGroup;
  
  isValidatingKey = false;
  apiKeyError = '';
  
  coachFeedback = signal<string | null>(null);
  isLoadingFeedback = signal(false);
  showLegal = false;

  constructor() {
    this.metabolismForm = this.fb.group({
      gender: ['male', Validators.required],
      age: [30, [Validators.required, Validators.min(13), Validators.max(120)]],
      weight: [70, [Validators.required, Validators.min(30), Validators.max(300)]],
      height: [170, [Validators.required, Validators.min(100), Validators.max(250)]],
      activityLevel: ['moderate', Validators.required],
      // Advanced optional fields
      bodyFat: [null],
      subcutaneousFat: [null],
      visceralFat: [null],
      muscleMass: [null],
      measuredBmr: [null]
    });

    this.goalForm = this.fb.group({
      goal: ['maintain', Validators.required]
    });

    this.apiForm = this.fb.group({
      apiKey: ['', Validators.required]
    });
  }

  async validateAndSave(stepper: any) {
    if (this.apiForm.invalid) return;

    this.isValidatingKey = true;
    this.apiKeyError = '';
    
    const key = this.apiForm.value.apiKey;
    const isValid = await this.geminiService.validateApiKey(key);

    if (isValid) {
      const profile: UserProfile = {
        ...this.metabolismForm.value,
        ...this.goalForm.value,
        apiKey: key
      };
      await this.profileService.updateProfile(profile);
      this.isValidatingKey = false;
      stepper.next();
      this.generateCoachFeedback();
    } else {
      this.apiKeyError = 'Clé API invalide ou problème de connexion. Veuillez réessayer.';
      this.isValidatingKey = false;
    }
  }

  async generateCoachFeedback() {
    this.isLoadingFeedback.set(true);
    try {
      const profile = { ...this.metabolismForm.value, ...this.goalForm.value };
      const stats = this.profileService.metabolicStats();
      const feedback = await this.geminiService.getCoachFeedback(profile, stats);
      this.coachFeedback.set(feedback);
    } catch (e) {
      this.coachFeedback.set("Désolé, je n'ai pas pu générer votre analyse pour le moment, mais vos données sont bien enregistrées !");
    } finally {
      this.isLoadingFeedback.set(false);
    }
  }

  finish() {
    this.router.navigate(['/dashboard']);
  }
}
