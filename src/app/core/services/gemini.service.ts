import { Injectable, inject } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProfileService } from './profile.service';
import { LogService } from './log.service';

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
    
    if (!this.genAI) {
      this.genAI = new GoogleGenerativeAI(key);
    }
    
    return this.genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });
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
