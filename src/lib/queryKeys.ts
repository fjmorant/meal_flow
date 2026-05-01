export const queryKeys = {
  mealPlans: {
    all: (userId: string) => ['meal_plans', userId] as const,
    last: (userId: string) => ['meal_plans', userId, 'last'] as const,
  },
} as const;
