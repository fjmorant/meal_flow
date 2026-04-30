export type Preferences = {
  dietaryRestrictions: string;
  cuisineStyle: string;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Input: {
    householdSize: number;
    preferences: Preferences;
  };
  MealPlan: {
    ingredients: string;
    householdSize: number;
    preferences: Preferences;
  };
};
