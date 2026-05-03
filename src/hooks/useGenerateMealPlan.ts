import { httpsCallable } from '@react-native-firebase/functions';
import { useQuery } from '@tanstack/react-query';

import { functionsEU } from '@/lib/firebase';
import type { Preferences } from '@/types/navigation';
import type { MealPlan } from '@/types/mealPlan';

interface GenerateParams {
  ingredients: string;
  preferences: Preferences;
  householdSize: number;
  mode?: 'ingredients' | 'scratch';
}

export function useGenerateMealPlan(params: GenerateParams) {
  return useQuery({
    queryKey: ['meal_plan', params.mode, params.ingredients, params.householdSize, params.preferences],
    queryFn: async () => {
      const fn = httpsCallable<GenerateParams, MealPlan>(functionsEU, 'generateMealPlan');
      const result = await fn(params);
      return result.data;
    },
    staleTime: Infinity,
    retry: 1,
  });
}
