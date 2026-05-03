import { firebase } from '@react-native-firebase/functions';

const functionsEU = firebase.app().functions('europe-west1');
import { useQuery } from '@tanstack/react-query';

import { useTranslation } from '@/contexts/LanguageContext';
import type { Preferences } from '@/types/navigation';
import type { MealPlan } from '@/types/mealPlan';

interface GenerateParams {
  ingredients: string;
  preferences: Preferences;
  householdSize: number;
  mode?: 'ingredients' | 'scratch';
}

async function generateMealPlan(params: GenerateParams & { language: string }): Promise<MealPlan> {
  const result = await functionsEU.httpsCallable('generateMealPlan')(params);
  return result.data as MealPlan;
}

export function useGenerateMealPlan(params: GenerateParams) {
  const { language } = useTranslation();
  return useQuery({
    queryKey: ['meal_plan', params.mode, params.ingredients, params.householdSize, params.preferences, language],
    queryFn: () => generateMealPlan({ ...params, language }),
    staleTime: Infinity,
    retry: 1,
  });
}
