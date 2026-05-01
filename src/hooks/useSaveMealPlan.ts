import auth from '@react-native-firebase/auth';
import { useQueryClient, useMutation } from '@tanstack/react-query';

import { mealPlansCollection } from '@/lib/firebase';
import { queryKeys } from '@/lib/queryKeys';
import type { MealPlan } from '@/types/mealPlan';

interface SaveParams {
  plan: MealPlan;
  ingredientsInput: string;
}

export function useSaveMealPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ plan, ingredientsInput }: SaveParams) => {
      const userId = auth().currentUser?.uid;
      if (!userId) throw new Error('Not authenticated');

      await mealPlansCollection().add({
        userId,
        createdAt: new Date(),
        planJson: plan,
        ingredientsInput,
      });
    },
    onSuccess: () => {
      const userId = auth().currentUser?.uid;
      if (userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.mealPlans.last(userId) });
      }
    },
  });
}
