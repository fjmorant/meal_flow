import { firebase } from '@react-native-firebase/functions';
import { useQuery } from '@tanstack/react-query';

import type { MealRecipe } from '@/types/mealPlan';

const functionsEU = firebase.app().functions('europe-west1');

interface Params {
  mealName: string;
  servings: number;
}

export function useMealRecipe({ mealName, servings }: Params) {
  return useQuery({
    queryKey: ['meal_recipe', mealName, servings],
    queryFn: async (): Promise<MealRecipe> => {
      const result = await functionsEU.httpsCallable('getMealRecipe')({ mealName, servings });
      return result.data as MealRecipe;
    },
    staleTime: Infinity,
    retry: 1,
  });
}
