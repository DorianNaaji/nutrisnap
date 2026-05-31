import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StorageService } from '../../core/services/storage.service';
import { ProfileService } from '../../core/services/profile.service';
import { GeminiService } from '../../core/services/gemini.service';
import { MealLog } from '../../core/models/meal.model';
import { RecapSheetComponent } from '../../shared/components/recap-sheet/recap-sheet.component';
import { TranslateService } from '../../core/services/translate.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

interface CalendarDay {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  isCurrentMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
  totalCalories: number;
  logCount: number;
  dotColor: 'none' | 'green' | 'orange' | 'red';
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatButtonToggleModule, TranslatePipe
  ],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  private storage = inject(StorageService);
  private profileService = inject(ProfileService);
  private gemini = inject(GeminiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private bottomSheet = inject(MatBottomSheet);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);

  isLoading = signal(true);
  isAnalysisLoading = signal(false);
  analysisPeriod = signal<'7days' | '30days'>('7days');
  currentYear = signal(new Date().getFullYear());
  currentMonth = signal(new Date().getMonth()); // 0-indexed
  monthLogs = signal<MealLog[]>([]);
  selectedDateStr = signal<string | null>(null);
  selectedDateLogs = signal<MealLog[]>([]);

  readonly WEEKDAYS = computed(() => this.translate.arr('history.weekdays'));
  readonly MONTHS = computed(() => this.translate.arr('history.months'));

  calendarDays = computed<CalendarDay[]>(() => {
    const year = this.currentYear();
    const month = this.currentMonth();
    const logs = this.monthLogs();
    const target = this.profileService.metabolicStats()?.dailyCalorieTarget ?? 2000;
    const today = new Date();
    const todayStr = this.toDateStr(today);

    const calMap = new Map<string, { totalCalories: number; logCount: number }>();
    for (const log of logs) {
      const existing = calMap.get(log.date) ?? { totalCalories: 0, logCount: 0 };
      calMap.set(log.date, {
        totalCalories: existing.totalCalories + log.calories,
        logCount: existing.logCount + 1
      });
    }

    // First day of month (Monday = 0 in our grid, but JS getDay(): 0=Sun, 1=Mon...)
    const firstDay = new Date(year, month, 1);
    // Shift so Monday is col 0
    const startOffset = (firstDay.getDay() + 6) % 7;

    const days: CalendarDay[] = [];

    // Padding days from previous month
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      const dateStr = this.toDateStr(d);
      days.push(this.buildDay(d, dateStr, false, todayStr, target, calMap));
    }

    // Days of current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dateStr = this.toDateStr(date);
      days.push(this.buildDay(date, dateStr, true, todayStr, target, calMap));
    }

    // Trailing days to complete last row (multiple of 7)
    while (days.length % 7 !== 0) {
      const d = new Date(year, month + 1, days.length - startOffset - daysInMonth + 1);
      const dateStr = this.toDateStr(d);
      days.push(this.buildDay(d, dateStr, false, todayStr, target, calMap));
    }

    return days;
  });

  private buildDay(
    date: Date,
    dateStr: string,
    isCurrentMonth: boolean,
    todayStr: string,
    target: number,
    calMap: Map<string, { totalCalories: number; logCount: number }>
  ): CalendarDay {
    const data = calMap.get(dateStr);
    const isToday = dateStr === todayStr;
    const isFuture = dateStr > todayStr;
    const totalCalories = data?.totalCalories ?? 0;
    const logCount = data?.logCount ?? 0;

    let dotColor: CalendarDay['dotColor'] = 'none';
    if (data && isCurrentMonth && !isFuture) {
      const pct = (totalCalories / target) * 100;
      dotColor = pct >= 80 && pct <= 105 ? 'green' : pct >= 50 ? 'orange' : 'red';
    }

    return { date, dateStr, isCurrentMonth, isToday, isFuture, totalCalories, logCount, dotColor };
  }

  private toDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  async ngOnInit() {
    await this.loadMonth();
    // Auto-ouvre le panel si on revient depuis /meal/:id avec ?date=
    const dateParam = this.route.snapshot.queryParamMap.get('date');
    if (dateParam) {
      const day = this.calendarDays().find(d => d.dateStr === dateParam);
      if (day) await this.selectDay(day);
    }
  }

  async loadMonth() {
    this.isLoading.set(true);
    // month is 0-indexed, getLogsByMonth expects 1-indexed
    const logs = await this.storage.getLogsByMonth(this.currentYear(), this.currentMonth() + 1);
    this.monthLogs.set(logs);
    this.selectedDateStr.set(null);
    this.selectedDateLogs.set([]);
    this.isLoading.set(false);
  }

  async prevMonth() {
    let m = this.currentMonth() - 1;
    let y = this.currentYear();
    if (m < 0) { m = 11; y--; }
    this.currentMonth.set(m);
    this.currentYear.set(y);
    await this.loadMonth();
  }

  async nextMonth() {
    const today = new Date();
    const y = this.currentYear();
    const m = this.currentMonth();
    // Block navigation beyond current month
    if (y === today.getFullYear() && m === today.getMonth()) return;
    let nm = m + 1;
    let ny = y;
    if (nm > 11) { nm = 0; ny++; }
    this.currentMonth.set(nm);
    this.currentYear.set(ny);
    await this.loadMonth();
  }

  isNextMonthDisabled(): boolean {
    const today = new Date();
    return this.currentYear() === today.getFullYear() && this.currentMonth() === today.getMonth();
  }

  async selectDay(day: CalendarDay) {
    if (!day.isCurrentMonth || day.isFuture) return;
    if (this.selectedDateStr() === day.dateStr) {
      this.selectedDateStr.set(null);
      this.selectedDateLogs.set([]);
      return;
    }
    this.selectedDateStr.set(day.dateStr);
    const logs = await this.storage.getLogsByDate(day.dateStr);
    this.selectedDateLogs.set(logs);
  }

  goToMeal(id: number) {
    this.router.navigate(['/meal', id], {
      queryParams: { date: this.selectedDateStr() }
    });
  }

  goToScanner() {
    this.router.navigate(['/scanner'], {
      queryParams: { date: this.selectedDateStr() }
    });
  }

  async openAnalysis() {
    if (this.isAnalysisLoading()) return;
    const profile = this.profileService.profile();
    const stats = this.profileService.metabolicStats();
    if (!profile?.apiKey) {
      this.snackBar.open(this.translate.t('history.analysis_no_api'), this.translate.t('common.close'), { duration: 4000 });
      return;
    }
    this.isAnalysisLoading.set(true);
    try {
      const period = this.analysisPeriod();
      const days = period === '7days' ? 7 : 30;
      const periodLabel = period === '7days' ? '7 derniers jours' : '30 derniers jours';

      // Collecte les logs sur la période
      const logs: MealLog[] = [];
      const today = new Date();
      for (let i = 0; i < days; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = this.toDateStr(d);
        const dayLogs = await this.storage.getLogsByDate(dateStr);
        logs.push(...dayLogs);
      }

      const text = await this.gemini.getWeeklyAnalysis(profile, logs, stats!, periodLabel);
      this.bottomSheet.open(RecapSheetComponent, {
        data: { title: this.translate.t('history.analysis_title'), subtitle: periodLabel, text }
      });
    } catch {
      this.snackBar.open(this.translate.t('history.analysis_error'), this.translate.t('common.close'), { duration: 4000 });
    } finally {
      this.isAnalysisLoading.set(false);
    }
  }

  get selectedDateFormatted(): string {
    const str = this.selectedDateStr();
    if (!str) return '';
    const [y, m, d] = str.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  get selectedDayTotalCalories(): number {
    return this.selectedDateLogs().reduce((acc, l) => acc + l.calories, 0);
  }

  isToday(dateStr: string): boolean {
    return dateStr === this.toDateStr(new Date());
  }
}
