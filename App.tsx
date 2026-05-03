import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { LanguageProvider, useTranslation } from '@/contexts/LanguageContext';
import { getOrCreateAnonymousSession } from '@/lib/firebase';
import { loadOnboardingData } from '@/lib/onboardingStorage';
import { queryClient } from '@/lib/queryClient';
import { HomeScreen } from '@/screens/HomeScreen';
import { InputScreen } from '@/screens/InputScreen';
import { MealDetailScreen } from '@/screens/MealDetailScreen';
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
  const { t } = useTranslation();
  return (
    <PlansStack.Navigator screenOptions={headerStyle}>
      <PlansStack.Screen name="Home" component={HomeScreen} options={{ title: t('appName') }} />
      <PlansStack.Screen name="MealPlan" component={MealPlanScreen} options={{ title: t('weeklyPlan') }} />
      <PlansStack.Screen
        name="MealDetail"
        component={MealDetailScreen}
        options={({ route }) => ({ title: route.params.mealName })}
      />
    </PlansStack.Navigator>
  );
}

function TabNavigator() {
  const { t } = useTranslation();
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
          tabBarLabel: t('plans'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🗓</Text>,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          ...headerStyle,
          headerShown: true,
          title: t('settings'),
          tabBarLabel: t('settings'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { t } = useTranslation();
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
    <RootStack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
      <RootStack.Screen name="MainTabs" component={TabNavigator} />
      <RootStack.Screen
        name="Input"
        component={InputScreen}
        options={({ route }) => ({
          ...headerStyle,
          headerShown: true,
          title: route.params.mode === 'scratch' ? t('planFromScratch') : t('newPlan'),
          presentation: 'modal',
        })}
      />
    </RootStack.Navigator>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </LanguageProvider>
  );
}
