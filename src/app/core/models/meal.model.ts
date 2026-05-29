export interface Ingredient {
  name: string;
  weightG: number;
  calories: number;
}

export interface MealLog {
  id?: number;
  timestamp: number; // For sorting and specific time
  date: string; // YYYY-MM-DD for indexing and filtering
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
  imageBlob?: Blob;
}

export interface DailyStats {
  totalCalories: number;
  totalProteins: number;
  totalCarbs: number;
  totalFats: number;
  remainingCalories: number;
}
