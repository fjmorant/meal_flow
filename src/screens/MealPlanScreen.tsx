import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useLayoutEffect } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGenerateMealPlan } from '@/hooks/useGenerateMealPlan';
import { useSaveMealPlan } from '@/hooks/useSaveMealPlan';
import type { PlansStackParamList } from '@/types/navigation';
import { DAYS } from '@/types/mealPlan';

type Props = NativeStackScreenProps<PlansStackParamList, 'MealPlan'>;

export function MealPlanScreen({ route, navigation }: Props) {
  const { ingredients, householdSize, preferences, savedPlan } = route.params;
  const queryClient = useQueryClient();
  const queryKey = ['meal_plan', ingredients, householdSize, preferences];

  const generated = useGenerateMealPlan(
    { ingredients, householdSize, preferences },
  );

  const { mutate: savePlan } = useSaveMealPlan();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable onPress={() => navigation.navigate('Home')} hitSlop={12}>
          <Text style={styles.headerBack}>← Plans</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  const data = savedPlan ?? generated.data;
  const isPending = !savedPlan && generated.isPending;
  const isError = !savedPlan && generated.isError;

  useEffect(() => {
    if (!savedPlan && generated.data) {
      savePlan({ plan: generated.data, ingredientsInput: ingredients });
    }
  }, [generated.data]);

  function handleRegenerate() {
    queryClient.removeQueries({ queryKey });
    generated.refetch();
  }

  if (isPending) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#208AEF" />
        <Text style={styles.loadingText}>Generating your meal plan...</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>Something went wrong. Please try again.</Text>
        <Pressable style={styles.button} onPress={() => generated.refetch()}>
          <Text style={styles.buttonText}>Retry</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Your Weekly Plan</Text>

        <Text style={styles.sectionTitle}>Meals</Text>
        {DAYS.map(day => (
          <View key={day} style={styles.dayCard}>
            <Text style={styles.dayName}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
            <View style={styles.mealRow}>
              <Text style={styles.mealLabel}>Lunch</Text>
              <Text style={styles.mealText}>{data?.week[day].lunch}</Text>
            </View>
            <View style={styles.mealRow}>
              <Text style={styles.mealLabel}>Dinner</Text>
              <Text style={styles.mealText}>{data?.week[day].dinner}</Text>
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Shopping List</Text>
        {(['vegetables', 'proteins', 'other'] as const).map(category => (
          <View key={category} style={styles.categoryCard}>
            <Text style={styles.categoryName}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
            {data?.shopping_list[category].map((item, i) => (
              <Text key={i} style={styles.listItem}>• {item}</Text>
            ))}
          </View>
        ))}

        {!savedPlan && (
          <Pressable style={styles.button} onPress={handleRegenerate}>
            <Text style={styles.buttonText}>Regenerate plan</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 24,
  },
  scroll: {
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  dayCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#208AEF',
  },
  mealRow: {
    flexDirection: 'row',
    gap: 8,
  },
  mealLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 50,
  },
  mealText: {
    fontSize: 14,
    flex: 1,
  },
  categoryCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    gap: 6,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  listItem: {
    fontSize: 14,
    color: '#333',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#e53e3e',
    textAlign: 'center',
  },
  headerBack: {
    color: '#208AEF',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#208AEF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
