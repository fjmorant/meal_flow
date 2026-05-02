import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { getOrCreateAnonymousSession } from '@/lib/firebase';
import { loadOnboardingData } from '@/lib/onboardingStorage';
import { queryClient } from '@/lib/queryClient';
import { HomeScreen } from '@/screens/HomeScreen';
import { InputScreen } from '@/screens/InputScreen';
import { MealPlanScreen } from '@/screens/MealPlanScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import type { PlansStackParamList, RootStackParamList, TabParamList } from '@/types/navigation';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const PlansStack = createNativeStackNavigator<PlansStackParamList>();

const headerStyle = {
  headerStyle: { backgroundColor: '#fff' } as object,
  headerTitleStyle: { fontWeight: '700' as const, fontSize: 18 },
  headerTintColor: '#208AEF',
  headerShadowVisible: false,
};

function PlansNavigator() {
  return (
    <PlansStack.Navigator screenOptions={headerStyle}>
      <PlansStack.Screen name="Home" component={HomeScreen} options={{ title: 'MealFlow' }} />
      <PlansStack.Screen name="MealPlan" component={MealPlanScreen} options={{ title: 'Weekly Plan' }} />
    </PlansStack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#208AEF',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { borderTopColor: '#eee' },
      }}>
      <Tab.Screen
        name="Plans"
        component={PlansNavigator}
        options={{
          tabBarLabel: 'Plans',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🗓</Text>,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          ...headerStyle,
          headerShown: true,
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState<'Onboarding' | 'MainTabs' | null>(null);

  useEffect(() => {
    async function init() {
      await getOrCreateAnonymousSession();
      const data = await loadOnboardingData();
      setInitialRoute(data ? 'MainTabs' : 'Onboarding');
    }
    init();
  }, []);

  if (!initialRoute) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <RootStack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
            <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
            <RootStack.Screen name="MainTabs" component={TabNavigator} />
            <RootStack.Screen
              name="Input"
              component={InputScreen}
              options={{ ...headerStyle, headerShown: true, title: 'New plan', presentation: 'modal' }}
            />
          </RootStack.Navigator>
        </NavigationContainer>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
