import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../core/services/profile.service';
import { LogService } from '../../core/services/log.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';

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
    RouterModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  profileService = inject(ProfileService);
  logService = inject(LogService);

  today = new Date();

  get progressValue(): number {
    const target = this.profileService.metabolicStats()?.dailyCalorieTarget || 2000;
    const consumed = this.logService.dailyStats().totalCalories;
    return Math.min(100, (consumed / target) * 100);
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
