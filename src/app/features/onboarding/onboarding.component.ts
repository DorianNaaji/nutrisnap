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
import { UserProfile, MetabolicStats } from '../../core/models/profile.model';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map, startWith, debounceTime } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';

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

  stepperOrientation: Observable<'horizontal' | 'vertical'>;
  currentStats = signal<MetabolicStats | null>(null);

  constructor() {
    this.stepperOrientation = inject(BreakpointObserver)
      .observe('(max-width: 800px)')
      .pipe(map(({ matches }) => (matches ? 'vertical' : 'horizontal')));

    this.metabolismForm = this.fb.group({
      gender: ['male', Validators.required],
      age: [30, [Validators.required, Validators.min(13), Validators.max(120)]],
      weight: [70, [Validators.required, Validators.min(30), Validators.max(300)]],
      height: [170, [Validators.required, Validators.min(100), Validators.max(250)]],
      activityLevel: ['moderate', Validators.required],
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

    // Save incrementally when form changes
    this.metabolismForm.valueChanges.pipe(debounceTime(500)).subscribe(() => this.savePartialProfile());
    this.goalForm.valueChanges.pipe(debounceTime(500)).subscribe(() => this.savePartialProfile());

    combineLatest([
      this.metabolismForm.valueChanges.pipe(startWith(this.metabolismForm.value)),
      this.goalForm.valueChanges.pipe(startWith(this.goalForm.value))
    ]).subscribe(([metabolism, goal]) => {
      this.calculateStats(metabolism, goal);
    });
  }

  private async savePartialProfile() {
    const partialProfile: UserProfile = {
      ...this.metabolismForm.value,
      ...this.goalForm.value
    };
    await this.storage.saveProfile(partialProfile);
  }


  private calculateStats(metabolism: any, goal: any) {
    if (this.metabolismForm.invalid) {
      this.currentStats.set(null);
      return;
    }

    let bmr = metabolism.measuredBmr || (10 * metabolism.weight + 6.25 * metabolism.height - 5 * metabolism.age);
    if (!metabolism.measuredBmr) {
      bmr = metabolism.gender === 'male' ? bmr + 5 : bmr - 161;
    }

    const activityMultipliers: any = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    const tdee = bmr * activityMultipliers[metabolism.activityLevel];

    const goalAdjustments: any = {
      lose_mild: -300,
      lose_moderate: -500,
      lose_aggressive: -750,
      maintain: 0,
      gain: 300
    };

    const dailyCalorieTargetRaw = tdee + goalAdjustments[goal.goal];
    const dailyCalorieTarget = Math.max(1200, bmr, dailyCalorieTargetRaw);
    const isSafetyFloorHit = dailyCalorieTarget > dailyCalorieTargetRaw;

    const targets = {
      proteins: Math.round((dailyCalorieTarget * 0.25) / 4),
      carbs: Math.round((dailyCalorieTarget * 0.45) / 4),
      fats: Math.round((dailyCalorieTarget * 0.30) / 9)
    };

    this.currentStats.set({ bmr, tdee, dailyCalorieTarget, isSafetyFloorHit, targets });
  }

  async validateAndSave(stepper: any) {
    if (this.apiForm.invalid) return;

    this.isValidatingKey = true;
    this.apiKeyError = '';
    
    const key = this.apiForm.value.apiKey;
    const result = await this.geminiService.validateApiKey(key);

    if (result.success) {
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
      this.apiKeyError = result.error || 'Erreur inconnue.';
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

  formatFeedback(text: string): string {
    if (!text) return '';
    // Basic Markdown Bold: **text** -> <strong>text</strong>
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Newlines to <br>
    formatted = formatted.replace(/\n/g, '<br>');
    return formatted;
  }
}
