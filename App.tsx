import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { getOrCreateAnonymousSession } from '@/lib/firebase';
import { queryClient } from '@/lib/queryClient';
import { HomeScreen } from '@/screens/HomeScreen';
import { InputScreen } from '@/screens/InputScreen';
import { MealPlanScreen } from '@/screens/MealPlanScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import type { RootStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getOrCreateAnonymousSession().then(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Input" component={InputScreen} />
            <Stack.Screen name="MealPlan" component={MealPlanScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
