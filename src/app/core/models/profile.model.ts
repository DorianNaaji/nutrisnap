export interface UserProfile {
  id?: number;
  gender: 'male' | 'female';
  age: number;
  weight: number;
  height: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose_mild' | 'lose_moderate' | 'lose_aggressive' | 'maintain' | 'gain';
  apiKey?: string;
  // Optional advanced metrics
  bodyFat?: number;
  subcutaneousFat?: number;
  visceralFat?: number;
  muscleMass?: number;
  measuredBmr?: number;
}

export interface MetabolicStats {
  bmr: number;
  tdee: number;
  dailyCalorieTarget: number;
  isSafetyFloorHit: boolean;
  targets: {
    proteins: number;
    carbs: number;
    fats: number;
  };
}
