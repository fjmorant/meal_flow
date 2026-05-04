import { addDoc, collection } from '@react-native-firebase/firestore';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { auth, db } from '@/lib/firebase';
import { queryKeys } from '@/lib/queryKeys';
import type { MealPlan } from '@/types/mealPlan';

interface SaveParams {
  plan: MealPlan;
  ingredientsInput: string;
  planName?: string;
}

export function useSaveMealPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ plan, ingredientsInput, planName }: SaveParams) => {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('Not authenticated');

      await addDoc(collection(db, 'meal_plans'), {
        userId,
        createdAt: new Date(),
        planJson: plan,
        ingredientsInput,
        ...(planName ? { planName } : {}),
      });
    },
    onSuccess: () => {
      const userId = auth.currentUser?.uid;
      if (userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.mealPlans.all(userId) });
      }
    },
  });
}
