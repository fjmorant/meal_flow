import { collection, getDocs, limit, orderBy, query, where } from '@react-native-firebase/firestore';
import { useQuery } from '@tanstack/react-query';

import { auth, db } from '@/lib/firebase';
import { queryKeys } from '@/lib/queryKeys';
import type { MealPlan } from '@/types/mealPlan';

export interface SavedMealPlan {
  id: string;
  plan: MealPlan;
  ingredientsInput: string;
  createdAt: Date;
  planName?: string;
}

export function useMealPlans() {
  const userId = auth.currentUser?.uid;

  return useQuery({
    queryKey: queryKeys.mealPlans.list(userId ?? ''),
    enabled: !!userId,
    queryFn: async (): Promise<SavedMealPlan[]> => {
      const q = query(
        collection(db, 'meal_plans'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          plan: data.planJson as MealPlan,
          ingredientsInput: data.ingredientsInput as string,
          createdAt: data.createdAt.toDate(),
          planName: data.planName as string | undefined,
        };
      });
    },
  });
}
