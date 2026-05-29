import { Injectable, inject } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProfileService } from './profile.service';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private profileService = inject(ProfileService);
  private genAI: GoogleGenerativeAI | null = null;

  async validateApiKey(key: string): Promise<boolean> {
    try {
      const tempAI = new GoogleGenerativeAI(key);
      const model = tempAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      await model.generateContent('Health check');
      return true;
    } catch (e) {
      return false;
    }
  }

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

  async analyzeMeal(imageB64: string, userText?: string) {
    const model = this.getModel();

    const prompt = `
      Tu es un expert en nutrition. Analyse cette image de repas.
      ${userText ? 'Précisions de l utilisateur : ' + userText : ''}
      
      Retourne un objet JSON valide avec cette structure précise :
      {
        "food_name": "nom précis du plat",
        "calories": number,
        "macros": { "prot": number, "carb": number, "fat": number },
        "ingredients_detected": [
          { "name": "nom", "est_weight_g": number, "confidence": number }
        ],
        "analysis_summary": "courte description de l'analyse",
        "confidence_score": "low|medium|high",
        "vegan_alternative": { "name": "string", "calories": number } | null
      }
    `;

    const base64Data = imageB64.split(',')[1] || imageB64;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg'
        }
      }
    ]);

    const response = await result.response;
    return JSON.parse(response.text());
  }

  async getCoachFeedback(profile: any, stats: any): Promise<string> {
    const model = this.getModel();
    
    const prompt = `
      Tu es un coach de vie et nutritionniste expert. Analyse les données métaboliques suivantes et donne un feedback motivant et constructif.
      Données :
      - Sexe: ${profile.gender}
      - Âge: ${profile.age} ans
      - Poids: ${profile.weight} kg
      - Taille: ${profile.height} cm
      - Activité: ${profile.activityLevel}
      - Objectif: ${profile.goal}
      - BMR (estimé): ${stats.bmr} kcal
      - TDEE (dépense totale): ${stats.tdee} kcal
      - Cible calorique: ${stats.dailyCalorieTarget} kcal
      ${profile.bodyFat ? `- Masse grasse: ${profile.bodyFat}%` : ''}
      ${profile.muscleMass ? `- Masse musculaire: ${profile.muscleMass}kg` : ''}

      Ton feedback doit :
      1. Être bienveillant et encourageant ("style coach").
      2. Expliquer brièvement ce que signifient ces chiffres pour l'utilisateur.
      3. Donner 2-3 conseils concrets (sport, alimentation, ou habitudes).
      4. Rappeler l'importance de la régularité.
      Gardes un ton court, impactant et formatté en paragraphes simples. Pas de JSON ici, juste du texte pur.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}
