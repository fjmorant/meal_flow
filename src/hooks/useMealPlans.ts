import auth from '@react-native-firebase/auth';
import { useQuery } from '@tanstack/react-query';

import { mealPlansCollection } from '@/lib/firebase';
import { queryKeys } from '@/lib/queryKeys';
import type { MealPlan } from '@/types/mealPlan';

export interface SavedMealPlan {
  id: string;
  plan: MealPlan;
  ingredientsInput: string;
  createdAt: Date;
}

export function useMealPlans() {
  const userId = auth().currentUser?.uid;

  return useQuery({
    queryKey: queryKeys.mealPlans.list(userId ?? ''),
    enabled: !!userId,
    queryFn: async (): Promise<SavedMealPlan[]> => {
      const snapshot = await mealPlansCollection()
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          plan: data.planJson as MealPlan,
          ingredientsInput: data.ingredientsInput as string,
          createdAt: data.createdAt.toDate(),
        };
      });
    },
  });
}
