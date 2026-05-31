import { Injectable, inject } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProfileService } from './profile.service';
import { LogService } from './log.service';
import { MealLog } from '../models/meal.model';
import { UserProfile, MetabolicStats } from '../models/profile.model';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private profileService = inject(ProfileService);
  private logService = inject(LogService);
  private genAI: GoogleGenerativeAI | null = null;



  private getModel() {
    const key = this.profileService.profile()?.apiKey;
    if (!key) throw new Error('API Key not configured');
    if (!this.genAI) this.genAI = new GoogleGenerativeAI(key);
    return this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });
  }

  private getTextModel() {
    const key = this.profileService.profile()?.apiKey;
    if (!key) throw new Error('API Key not configured');
    if (!this.genAI) this.genAI = new GoogleGenerativeAI(key);
    return this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async analyzeMeal(imagesB64: string[], userText: string, mealType: string) {
    const model = this.getModel();
    const stats = this.profileService.metabolicStats();
    const history = this.logService.dailyStats();
    
    const prompt = `
      Tu es un expert en nutrition. Analyse ce repas de type "${mealType}".
      Contexte utilisateur :
      - Objectif quotidien: ${stats?.dailyCalorieTarget} kcal
      - Déjà consommé ce jour: ${history.totalCalories} kcal

      [Optionnel] Précisions utilisateur : ${userText || 'Aucune'}

      Réponds UNIQUEMENT en JSON valide avec cette structure stricte (sans markdown ou autre texte):
      {
        "status": "success | error",
        "food_name": "nom précis",
        "calories": number,
        "macros": { "prot": number, "carb": number, "fat": number },
        "analysis_summary": "courte description",
        "coach_tip": "Conseil personnalisé basé sur la journée",
        "error_message": "Si status=error, explique pourquoi l'analyse est impossible (ex: pas de nourriture, flou...)"
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
    const goal = { lose_mild:'perte de poids légère', lose_moderate:'perte de poids modérée', lose_aggressive:'perte de poids agressive', maintain:'maintien', gain:'prise de masse' }[profile.goal] ?? profile.goal;
    const totalCal = logs.reduce((s, l) => s + l.calories, 0);
    const totalProt = logs.reduce((s, l) => s + l.macros.proteins, 0);
    const totalCarb = logs.reduce((s, l) => s + l.macros.carbs, 0);
    const totalFat = logs.reduce((s, l) => s + l.macros.fats, 0);
    const mealList = logs.map(l => `- ${l.foodName} (${l.calories} kcal, P:${l.macros.proteins}g G:${l.macros.carbs}g L:${l.macros.fats}g)`).join('\n');

    const prompt = `Tu es un coach nutritionnel bienveillant. Voici le bilan de la journée de l'utilisateur.

Profil : ${profile.gender === 'male' ? 'Homme' : 'Femme'}, ${profile.age} ans, ${profile.weight} kg, objectif : ${goal}
Objectif calorique quotidien : ${stats.dailyCalorieTarget} kcal
Cibles macros : P ${stats.targets.proteins}g / G ${stats.targets.carbs}g / L ${stats.targets.fats}g

Repas du jour :
${mealList || '- Aucun repas enregistré'}

Totaux : ${totalCal} kcal | Protéines ${totalProt}g | Glucides ${totalCarb}g | Lipides ${totalFat}g

Fais un bilan coach court (4-5 phrases max) : ce qui est positif, ce qui peut être amélioré, et une suggestion concrète pour demain. Ton encourageant. Texte brut uniquement, pas de JSON, pas de markdown.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  async getWeeklyAnalysis(profile: UserProfile, logs: MealLog[], stats: MetabolicStats, periodLabel: string): Promise<string> {
    const model = this.getTextModel();
    const goal = { lose_mild:'perte de poids légère', lose_moderate:'perte de poids modérée', lose_aggressive:'perte de poids agressive', maintain:'maintien', gain:'prise de masse' }[profile.goal] ?? profile.goal;

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

    const prompt = `Tu es un coach nutritionnel expert. Analyse la progression de l'utilisateur sur ${periodLabel}.

Profil : ${profile.gender === 'male' ? 'Homme' : 'Femme'}, ${profile.age} ans, ${profile.weight} kg, objectif : ${goal}
Objectif calorique quotidien : ${stats.dailyCalorieTarget} kcal
Cibles macros : P ${stats.targets.proteins}g / G ${stats.targets.carbs}g / L ${stats.targets.fats}g

Détail par jour :
${dayLines || '- Aucune donnée'}

Moyennes sur la période (${n} jours avec repas) :
- Calories : ${avgCal} kcal/j (vs objectif ${stats.dailyCalorieTarget} kcal)
- Protéines : ${avgProt}g/j | Glucides : ${avgCarb}g/j | Lipides : ${avgFat}g/j

Fais une analyse de progression (6-8 phrases) : tendances, régularité, points forts, axes d'amélioration, ajustements suggérés. Ton professionnel mais encourageant. Texte brut uniquement, pas de JSON, pas de markdown.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  async getCoachFeedback(key: string, profile: any, stats: any): Promise<string> {
    const textModel = new GoogleGenerativeAI(key).getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `
      Tu es un coach de vie et nutritionniste expert. Analyse les données métaboliques suivantes et donne un feedback motivant et constructif.
      Données :
      - Sexe: ${profile.gender}
      - Âge: ${profile.age} ans
      - Poids: ${profile.weight} kg
      - Taille: ${profile.height} cm
      - Activité: ${profile.activityLevel}
      - Objectif: ${profile.goal}
      - BMR (besoin vital au repos): ${stats.bmr} kcal
      - TDEE (dépense totale estimée): ${stats.tdee} kcal
      - Cible calorique calculée: ${stats.dailyCalorieTarget} kcal
      ${stats.isSafetyFloorHit ? `(Note: La cible a été bloquée au niveau du BMR car l'objectif initial était trop bas et dangereux pour le métabolisme)` : ''}
      ${profile.bodyFat ? `- Masse grasse: ${profile.bodyFat}%` : ''}
      ${profile.muscleMass ? `- Masse musculaire: ${profile.muscleMass}kg` : ''}

      Ton feedback doit :
      1. Être bienveillant et encourageant ("style coach").
      2. Expliquer brièvement ce que signifient ces chiffres pour l'utilisateur.
      3. Donner 2-3 conseils concrets (sport, alimentation, ou habitudes).
      4. Rappeler l'importance de la régularité.
      Gardes un ton court, impactant et formatté en paragraphes simples. 
      IMPORTANT: Réponds UNIQUEMENT en texte brut. Ne mets PAS de balises JSON, pas de crochets [], pas d'accolades {}. Juste ton texte de coach.
    `;

    const result = await textModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}
