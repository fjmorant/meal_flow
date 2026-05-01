import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { getOrCreateAnonymousSession } from '@/lib/firebase';
import { loadOnboardingData, type OnboardingData } from '@/lib/onboardingStorage';
import { queryClient } from '@/lib/queryClient';
import { InputScreen } from '@/screens/InputScreen';
import { MealPlanScreen } from '@/screens/MealPlanScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import type { RootStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);
  const [savedOnboarding, setSavedOnboarding] = useState<OnboardingData | null>(null);

  useEffect(() => {
    async function init() {
      await getOrCreateAnonymousSession();
      const data = await loadOnboardingData();
      setSavedOnboarding(data);
      setInitialRoute(data ? 'Input' : 'Onboarding');
    }
    init();
  }, []);

  if (!initialRoute) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen
              name="Input"
              component={InputScreen}
              initialParams={savedOnboarding ?? undefined}
            />
            <Stack.Screen name="MealPlan" component={MealPlanScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
