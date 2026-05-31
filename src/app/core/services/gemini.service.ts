import { Injectable, inject } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProfileService } from './profile.service';
import { LogService } from './log.service';
import { TranslateService } from './translate.service';
import { MealLog } from '../models/meal.model';
import { UserProfile, MetabolicStats } from '../models/profile.model';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private profileService = inject(ProfileService);
  private logService = inject(LogService);
  private translate = inject(TranslateService);
  private genAI: GoogleGenerativeAI | null = null;
  private cachedKey: string | null = null;

  private get langInstruction(): string {
    return this.translate.currentLang() === 'fr'
      ? 'Réponds en français.'
      : 'Reply in English.';
  }

  private goalLabel(goal: UserProfile['goal']): string {
    return this.translate.t(`profile.${goal}`);
  }

  private genderLabel(gender: string): string {
    return this.translate.t(gender === 'male' ? 'profile.male' : 'profile.female');
  }

  private getGenAI(): GoogleGenerativeAI {
    const key = this.profileService.profile()?.apiKey;
    if (!key) throw new Error('API Key not configured');
    if (!this.genAI || this.cachedKey !== key) {
      this.genAI = new GoogleGenerativeAI(key);
      this.cachedKey = key;
    }
    return this.genAI;
  }

  private getModel() {
    return this.getGenAI().getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });
  }

  private getTextModel() {
    return this.getGenAI().getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async analyzeMeal(imagesB64: string[], userText: string, mealType: string) {
    const model = this.getModel();
    const stats = this.profileService.metabolicStats();
    const history = this.logService.dailyStats();
    
    const prompt = `
      You are a nutrition expert. Analyse this meal of type "${mealType}".
      User context:
      - Daily calorie goal: ${stats?.dailyCalorieTarget} kcal
      - Already consumed today: ${history.totalCalories} kcal
      - User note: ${userText || 'None'}

      ${this.langInstruction}
      Reply ONLY with valid JSON (no markdown, no extra text):
      {
        "status": "success | error",
        "food_name": "precise name",
        "calories": number,
        "macros": { "prot": number, "carb": number, "fat": number },
        "analysis_summary": "short description",
        "coach_tip": "personalised tip based on the day",
        "confidence_score": "low | medium | high",
        "error_message": "if status=error, explain why analysis is impossible"
      }
    `;

    const parts: any[] = [prompt];
    imagesB64.forEach(img => {
      parts.push({
        inlineData: {
          data: img.split(',')[1] || img,
          mimeType: 'image/jpeg'
        }
      });
    });

    const result = await model.generateContent(parts);
    const response = await result.response;
    
    // Clean response just in case
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  }

  async getDailyRecap(profile: UserProfile, logs: MealLog[], stats: MetabolicStats): Promise<string> {
    const model = this.getTextModel();
    const goal = this.goalLabel(profile.goal);
    const gender = this.genderLabel(profile.gender);
    const totalCal = logs.reduce((s, l) => s + l.calories, 0);
    const totalProt = logs.reduce((s, l) => s + l.macros.proteins, 0);
    const totalCarb = logs.reduce((s, l) => s + l.macros.carbs, 0);
    const totalFat = logs.reduce((s, l) => s + l.macros.fats, 0);
    const mealList = logs.map(l => `- ${l.foodName} (${l.calories} kcal, P:${l.macros.proteins}g C:${l.macros.carbs}g F:${l.macros.fats}g)`).join('\n');

    const prompt = `You are a supportive nutrition coach. Here is the user's day summary.

Profile: ${gender}, ${profile.age} years, ${profile.weight} kg, goal: ${goal}
Daily calorie target: ${stats.dailyCalorieTarget} kcal
Macro targets: P ${stats.targets.proteins}g / C ${stats.targets.carbs}g / F ${stats.targets.fats}g

Today's meals:
${mealList || '- No meals logged'}

Totals: ${totalCal} kcal | Proteins ${totalProt}g | Carbs ${totalCarb}g | Fats ${totalFat}g

Write a short coach recap (4-5 sentences max): positives, what could improve, one concrete suggestion for tomorrow. Encouraging tone. Plain text only, no JSON, no markdown.
${this.langInstruction}`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  async getWeeklyAnalysis(profile: UserProfile, logs: MealLog[], stats: MetabolicStats, periodLabel: string): Promise<string> {
    const model = this.getTextModel();
    const goal = this.goalLabel(profile.goal);
    const gender = this.genderLabel(profile.gender);

    // Agrégation par jour
    const byDay = new Map<string, { cal: number; prot: number; carb: number; fat: number; count: number }>();
    for (const log of logs) {
      const d = byDay.get(log.date) ?? { cal: 0, prot: 0, carb: 0, fat: 0, count: 0 };
      byDay.set(log.date, { cal: d.cal + log.calories, prot: d.prot + log.macros.proteins, carb: d.carb + log.macros.carbs, fat: d.fat + log.macros.fats, count: d.count + 1 });
    }

    const days = [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b));
    const n = days.length || 1;
    const avgCal = Math.round(days.reduce((s, [, d]) => s + d.cal, 0) / n);
    const avgProt = Math.round(days.reduce((s, [, d]) => s + d.prot, 0) / n);
    const avgCarb = Math.round(days.reduce((s, [, d]) => s + d.carb, 0) / n);
    const avgFat = Math.round(days.reduce((s, [, d]) => s + d.fat, 0) / n);
    const dayLines = days.map(([date, d]) => `- ${date} : ${d.cal} kcal (${d.count} repas)`).join('\n');

    const prompt = `You are an expert nutrition coach. Analyse the user's progress over ${periodLabel}.

Profile: ${gender}, ${profile.age} years, ${profile.weight} kg, goal: ${goal}
Daily calorie target: ${stats.dailyCalorieTarget} kcal
Macro targets: P ${stats.targets.proteins}g / C ${stats.targets.carbs}g / F ${stats.targets.fats}g

Daily breakdown:
${dayLines || '- No data'}

Averages over the period (${n} days with meals):
- Calories: ${avgCal} kcal/day (vs target ${stats.dailyCalorieTarget} kcal)
- Proteins: ${avgProt}g/day | Carbs: ${avgCarb}g/day | Fats: ${avgFat}g/day

Write a progress analysis (6-8 sentences): trends, consistency, strengths, areas for improvement, suggested adjustments. Professional but encouraging tone. Plain text only, no JSON, no markdown.
${this.langInstruction}`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  async getCoachFeedback(key: string, profile: any, stats: any): Promise<string> {
    const textModel = new GoogleGenerativeAI(key).getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const langInstr = this.translate.currentLang() === 'fr' ? 'Réponds en français.' : 'Reply in English.';
    const prompt = `
      You are an expert life coach and nutritionist. Analyse the following metabolic data and give motivating, constructive feedback.
      Data:
      - Gender: ${profile.gender}
      - Age: ${profile.age} years
      - Weight: ${profile.weight} kg
      - Height: ${profile.height} cm
      - Activity level: ${profile.activityLevel}
      - Goal: ${profile.goal}
      - BMR (rest metabolic rate): ${stats.bmr} kcal
      - TDEE (total daily expenditure): ${stats.tdee} kcal
      - Calculated calorie target: ${stats.dailyCalorieTarget} kcal
      ${stats.isSafetyFloorHit ? '(Note: target was floored at BMR — the initial goal was too low and metabolically unsafe)' : ''}
      ${profile.bodyFat ? `- Body fat: ${profile.bodyFat}%` : ''}
      ${profile.muscleMass ? `- Muscle mass: ${profile.muscleMass}kg` : ''}

      Your feedback must:
      1. Be warm and encouraging (coach style).
      2. Briefly explain what these numbers mean for the user.
      3. Give 2-3 concrete tips (exercise, nutrition, or habits).
      4. Remind the importance of consistency.
      Keep it short, impactful, in simple paragraphs.
      IMPORTANT: Plain text only — no JSON, no brackets, no braces.
      ${langInstr}
    `;

    const result = await textModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}
