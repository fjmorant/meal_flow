import { deleteDoc, doc } from '@react-native-firebase/firestore';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { auth, db } from '@/lib/firebase';
import { queryKeys } from '@/lib/queryKeys';

export function useDeleteMealPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string) => {
      await deleteDoc(doc(db, 'meal_plans', planId));
    },
    onSuccess: () => {
      const userId = auth.currentUser?.uid;
      if (userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.mealPlans.all(userId) });
      }
    },
  });
}
