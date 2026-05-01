export interface DayPlan {
  lunch: string;
  dinner: string;
}

export interface MealPlan {
  week: {
    monday: DayPlan;
    tuesday: DayPlan;
    wednesday: DayPlan;
    thursday: DayPlan;
    friday: DayPlan;
    saturday: DayPlan;
    sunday: DayPlan;
  };
  shopping_list: {
    vegetables: string[];
    proteins: string[];
    other: string[];
  };
}

export const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export type Day = (typeof DAYS)[number];
