import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Preferences } from '@/types/navigation';

const KEY = 'onboarding_prefs';

export interface OnboardingData {
  householdSize: number;
  preferences: Preferences;
}

export async function saveOnboardingData(data: OnboardingData) {
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
}

export async function loadOnboardingData(): Promise<OnboardingData | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return null;
  return JSON.parse(raw) as OnboardingData;
}
