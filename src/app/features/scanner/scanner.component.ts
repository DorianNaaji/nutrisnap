import { Component, inject, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GeminiService } from '../../core/services/gemini.service';
import { LogService } from '../../core/services/log.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-scanner',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatButtonModule, MatIconModule, 
    MatSelectModule, MatInputModule, MatCardModule, MatProgressSpinnerModule
  ],
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.css']
})
export class ScannerComponent {
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  
  private geminiService = inject(GeminiService);
  private logService = inject(LogService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  scannerForm: FormGroup;
  capturedImages = signal<string[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  // Date cible : aujourd'hui par défaut, ou date passée si ?date= fourni
  private targetDate: string = this.localDateStr(new Date());

  constructor() {
    this.scannerForm = this.fb.group({
      mealType: ['déjeuner', Validators.required],
      description: ['']
    });
    const dateParam = this.route.snapshot.queryParamMap.get('date');
    if (dateParam) this.targetDate = dateParam;
    this.startCamera();
  }

  goBack() {
    const dateParam = this.route.snapshot.queryParamMap.get('date');
    if (dateParam) {
      this.router.navigate(['/history'], { queryParams: { date: dateParam } });
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  async startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      this.video.nativeElement.srcObject = stream;
    } catch (err) {
      console.error('Camera access failed', err);
    }
  }

  capture() {
    const video = this.video.nativeElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    
    const image = canvas.toDataURL('image/jpeg', 0.7);
    this.capturedImages.update(imgs => [...imgs, image]);
  }

  removeImage(index: number) {
    this.capturedImages.update(imgs => imgs.filter((_, i) => i !== index));
  }

  private localDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private dataUrlToBlob(dataUrl: string): Blob {
    const [header, data] = dataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
    const binary = atob(data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mimeType });
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      for (const file of files) {
        const reader = new FileReader();
        reader.onload = (e: any) => this.capturedImages.update(imgs => [...imgs, e.target.result]);
        reader.readAsDataURL(file);
      }
    }
  }

  async submit() {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const response = await this.geminiService.analyzeMeal(
        this.capturedImages(), 
        this.scannerForm.value.description,
        this.scannerForm.value.mealType
      );

      if (response.status === 'success') {
        const firstImage = this.capturedImages()[0] ?? null;
        const mealLog = {
          timestamp: Date.now(),
          date: this.targetDate,
          foodName: response.food_name,
          calories: response.calories,
          macros: {
            proteins: response.macros?.prot ?? 0,
            carbs: response.macros?.carb ?? 0,
            fats: response.macros?.fat ?? 0
          },
          ingredients: [],
          analysisSummary: response.analysis_summary,
          coachTip: response.coach_tip ?? null,
          confidence: response.confidence_score ?? 'medium',
          imageBlob: firstImage ? this.dataUrlToBlob(firstImage) : undefined
        };
        
        await this.logService.addLog(mealLog);
        const dateParam = this.route.snapshot.queryParamMap.get('date');
        if (dateParam) {
          this.router.navigate(['/history'], { queryParams: { date: dateParam } });
        } else {
          this.router.navigate(['/dashboard']);
        }
      } else {
        this.errorMessage.set(response.error_message || 'Une erreur est survenue.');
      }
    } catch (e) {
      this.errorMessage.set("Erreur de communication avec l'IA.");
    } finally {
      this.isLoading.set(false);
    }
  }
}
