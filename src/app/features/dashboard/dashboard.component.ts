import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../core/services/profile.service';
import { LogService } from '../../core/services/log.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { NsCardComponent } from '../../shared/components/design-system/card.component';
import { CountUpDirective } from '../../shared/directives/count-up.directive';
import { GeminiService } from '../../core/services/gemini.service';
import { StorageService } from '../../core/services/storage.service';
import { RecapSheetComponent } from '../../shared/components/recap-sheet/recap-sheet.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    RouterModule,
    NsCardComponent,
    CountUpDirective
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  profileService = inject(ProfileService);
  logService = inject(LogService);
  private router = inject(Router);
  private gemini = inject(GeminiService);
  private storage = inject(StorageService);
  private bottomSheet = inject(MatBottomSheet);
  private snackBar = inject(MatSnackBar);

  today = new Date();
  isRecapLoading = signal(false);
  hasRecapToday = signal(false);

  private localDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  async ngOnInit() {
    const todayStr = this.localDateStr(new Date());
    const existing = await this.storage.getRecapByDate(todayStr);
    this.hasRecapToday.set(!!existing);
  }

  async openDailyRecap() {
    if (this.isRecapLoading()) return;
    const profile = this.profileService.profile();
    const stats = this.profileService.metabolicStats();
    if (!profile?.apiKey) {
      this.snackBar.open('Configurez votre clé API Gemini dans le profil.', 'Fermer', { duration: 4000 });
      return;
    }
    const todayStr = this.localDateStr(new Date());
    const existing = await this.storage.getRecapByDate(todayStr);
    if (existing) {
      this.bottomSheet.open(RecapSheetComponent, {
        data: { title: 'Bilan IA du jour', subtitle: 'Généré par Gemini · Mis en cache', text: existing.summary }
      });
      return;
    }
    this.isRecapLoading.set(true);
    try {
      const logs = await this.storage.getLogsByDate(todayStr);
      const text = await this.gemini.getDailyRecap(profile, logs, stats!);
      await this.storage.saveRecap({ date: todayStr, summary: text, generatedAt: Date.now() });
      this.hasRecapToday.set(true);
      this.bottomSheet.open(RecapSheetComponent, {
        data: { title: 'Bilan IA du jour', text }
      });
    } catch {
      this.snackBar.open("Impossible de générer le bilan. Vérifie ta clé API.", 'Fermer', { duration: 4000 });
    } finally {
      this.isRecapLoading.set(false);
    }
  }

  goToMeal(id: number) {
    this.router.navigate(['/meal', id]);
  }

  get progressValue(): number {
    const target = this.profileService.metabolicStats()?.dailyCalorieTarget || 2000;
    const consumed = this.logService.dailyStats().totalCalories;
    return Math.min(100, (consumed / target) * 100);
  }

  get isSurplus(): boolean {
    return this.logService.dailyStats().remainingCalories < 0;
  }

  getMacroProgress(type: 'proteins' | 'carbs' | 'fats'): number {
    const stats = this.logService.dailyStats();
    const targets = this.profileService.metabolicStats()?.targets;
    if (!targets) return 0;

    const consumed = type === 'proteins' ? stats.totalProteins : 
                     type === 'carbs' ? stats.totalCarbs : stats.totalFats;
    const target = targets[type];

    return Math.min(100, (consumed / target) * 100);
  }
}
