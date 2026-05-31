export interface Ingredient {
  name: string;
  weightG: number;
  calories: number;
}

export interface MealLog {
  id?: number;
  timestamp: number;
  date: string; // YYYY-MM-DD
  foodName: string;
  calories: number;
  macros: {
    proteins: number;
    carbs: number;
    fats: number;
  };
  ingredients: Ingredient[];
  analysisSummary: string;
  confidence: 'low' | 'medium' | 'high';
  coachTip?: string | null;
  imageBlob?: Blob;
}

export interface DailyStats {
  totalCalories: number;
  totalProteins: number;
  totalCarbs: number;
  totalFats: number;
  remainingCalories: number;
}

export interface DailyRecap {
  id?: number;
  date: string;        // YYYY-MM-DD
  summary: string;     // Texte coach Gemini
  generatedAt: number; // timestamp
}
