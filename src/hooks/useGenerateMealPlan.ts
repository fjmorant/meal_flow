import { firebase } from '@react-native-firebase/functions';

const functionsEU = firebase.app().functions('europe-west1');
import { useQuery } from '@tanstack/react-query';

import type { Preferences } from '@/types/navigation';
import type { MealPlan } from '@/types/mealPlan';

interface GenerateParams {
  ingredients: string;
  preferences: Preferences;
  householdSize: number;
}

async function generateMealPlan(params: GenerateParams): Promise<MealPlan> {
  const result = await functionsEU.httpsCallable('generateMealPlan')(params);
  return result.data as MealPlan;
}

export function useGenerateMealPlan(params: GenerateParams) {
  return useQuery({
    queryKey: ['meal_plan', params.ingredients, params.householdSize, params.preferences],
    queryFn: () => generateMealPlan(params),
    staleTime: Infinity,
    retry: 1,
  });
}
