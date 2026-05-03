import { firebase } from '@react-native-firebase/functions';
import { useQuery } from '@tanstack/react-query';

import { useTranslation } from '@/contexts/LanguageContext';
import type { MealRecipe } from '@/types/mealPlan';

const functionsEU = firebase.app().functions('europe-west1');

interface Params {
  mealName: string;
  servings: number;
}

export function useMealRecipe({ mealName, servings }: Params) {
  const { language } = useTranslation();
  return useQuery({
    queryKey: ['meal_recipe', mealName, servings, language],
    queryFn: async (): Promise<MealRecipe> => {
      const result = await functionsEU.httpsCallable('getMealRecipe')({ mealName, servings, language });
      return result.data as MealRecipe;
    },
    staleTime: Infinity,
    retry: 1,
  });
}
