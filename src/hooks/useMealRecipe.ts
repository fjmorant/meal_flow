import { httpsCallable } from '@react-native-firebase/functions';
import { useQuery } from '@tanstack/react-query';

import { functionsEU } from '@/lib/firebase';
import type { MealRecipe } from '@/types/mealPlan';

interface Params {
  mealName: string;
  servings: number;
}

export function useMealRecipe({ mealName, servings }: Params) {
  return useQuery({
    queryKey: ['meal_recipe', mealName, servings],
    queryFn: async (): Promise<MealRecipe> => {
      const fn = httpsCallable<Params, MealRecipe>(functionsEU, 'getMealRecipe');
      const result = await fn({ mealName, servings });
      return result.data;
    },
    staleTime: Infinity,
    retry: 1,
  });
}
