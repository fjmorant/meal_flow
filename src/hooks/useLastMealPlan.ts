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

export function useLastMealPlan() {
  const userId = auth().currentUser?.uid;

  return useQuery({
    queryKey: queryKeys.mealPlans.last(userId ?? ''),
    enabled: !!userId,
    queryFn: async (): Promise<SavedMealPlan | null> => {
      const snapshot = await mealPlansCollection()
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        plan: data.planJson as MealPlan,
        ingredientsInput: data.ingredientsInput as string,
        createdAt: data.createdAt.toDate(),
      };
    },
  });
}
