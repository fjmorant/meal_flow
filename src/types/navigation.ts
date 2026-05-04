import type { MealPlan } from '@/types/mealPlan';

export type Preferences = {
  dietaryRestrictions: string;
  cuisineStyle: string;
  cookingTime: string;
  budget: string;
  healthGoal: string;
};

// Root stack — holds the tab navigator, onboarding, and Input modal
export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
  Input: { householdSize: number; preferences: Preferences; mode: 'ingredients' | 'scratch' };
};

// Bottom tab navigator
export type TabParamList = {
  Plans: undefined;
  Settings: undefined;
};

// Stack nested inside the Plans tab
export type PlansStackParamList = {
  Home: undefined;
  MealPlan: {
    ingredients: string;
    householdSize: number;
    preferences: Preferences;
    savedPlan?: MealPlan;
    mode?: 'ingredients' | 'scratch';
    planName?: string;
  };
  MealDetail: {
    mealName: string;
    mealType: 'lunch' | 'dinner';
    householdSize: number;
  };
};
