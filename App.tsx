import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { queryClient } from '@/lib/queryClient';
import { InputScreen } from '@/screens/InputScreen';
import { MealPlanScreen } from '@/screens/MealPlanScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import type { RootStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Onboarding" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Input" component={InputScreen} />
            <Stack.Screen name="MealPlan" component={MealPlanScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
