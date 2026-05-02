import auth from '@react-native-firebase/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { mealPlansCollection } from '@/lib/firebase';
import { queryKeys } from '@/lib/queryKeys';

export function useDeleteMealPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string) => {
      await mealPlansCollection().doc(planId).delete();
    },
    onSuccess: () => {
      const userId = auth().currentUser?.uid;
      if (userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.mealPlans.all(userId) });
      }
    },
  });
}
