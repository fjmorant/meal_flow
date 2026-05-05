import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTranslation } from '@/contexts/LanguageContext';
import { useGenerateMealPlan } from '@/hooks/useGenerateMealPlan';
import { useSaveMealPlan } from '@/hooks/useSaveMealPlan';
import type { PlansStackParamList } from '@/types/navigation';
import { DAYS } from '@/types/mealPlan';
import type { TranslationKey } from '@/lib/i18n';

type Props = NativeStackScreenProps<PlansStackParamList, 'MealPlan'>;

export function MealPlanScreen({ route, navigation }: Props) {
  const { ingredients, householdSize, preferences, savedPlan, mode, planName } = route.params;
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const queryKey = ['meal_plan', mode, ingredients, householdSize, preferences];

  const generated = useGenerateMealPlan({ ingredients, householdSize, preferences, mode });

  const { mutate: savePlan } = useSaveMealPlan();
  const hasSaved = useRef(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.headerBack}>{t('backToPlans')}</Text>
        </Pressable>
      ),
    });
  }, [navigation, t]);

  const data = savedPlan ?? generated.data;
  const isPending = !savedPlan && generated.isPending;
  const isError = !savedPlan && generated.isError;

  useEffect(() => {
    if (!savedPlan && generated.data && !hasSaved.current) {
      hasSaved.current = true;
      savePlan({ plan: generated.data, ingredientsInput: ingredients, planName });
    }
  }, [generated.data]);

  function handleRegenerate() {
    hasSaved.current = false;
    queryClient.removeQueries({ queryKey });
    generated.refetch();
  }

  if (isPending) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#208AEF" />
        <Text style={styles.loadingText}>{t('generatingPlan')}</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{t('somethingWentWrong')}</Text>
        <Pressable style={styles.button} onPress={() => generated.refetch()}>
          <Text style={styles.buttonText}>{t('retry')}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{planName || t('yourWeeklyPlan')}</Text>

        <Text style={styles.sectionTitle}>{t('meals')}</Text>
        {DAYS.map(day => (
          <View key={day} style={styles.dayCard}>
            <Text style={styles.dayName}>{t(day as TranslationKey)}</Text>
            {(['lunch', 'dinner'] as const).map(mealType => {
              const mealName = data?.week[day][mealType];
              return (
                <Pressable
                  key={mealType}
                  style={styles.mealRow}
                  onPress={() =>
                    mealName &&
                    navigation.navigate('MealDetail', {
                      mealName,
                      mealType,
                      householdSize,
                    })
                  }>
                  <Text style={styles.mealLabel}>{t(mealType as TranslationKey)}</Text>
                  <Text style={styles.mealText}>{mealName}</Text>
                  <Text style={styles.mealArrow}>›</Text>
                </Pressable>
              );
            })}
          </View>
        ))}

        <Text style={styles.sectionTitle}>{t('shoppingList')}</Text>
        {(['vegetables', 'proteins', 'other'] as const).map(category => (
          <View key={category} style={styles.categoryCard}>
            <Text style={styles.categoryName}>{t(category as TranslationKey)}</Text>
            {data?.shopping_list[category].map((item, i) => (
              <Text key={i} style={styles.listItem}>• {item}</Text>
            ))}
          </View>
        ))}

        {!savedPlan && (
          <Pressable style={styles.button} onPress={handleRegenerate}>
            <Text style={styles.buttonText}>{t('regeneratePlan')}</Text>
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
    alignItems: 'center',
    paddingVertical: 2,
  },
  mealLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 70,
  },
  mealText: {
    fontSize: 14,
    flex: 1,
  },
  mealArrow: {
    fontSize: 18,
    color: '#208AEF',
    fontWeight: '600',
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
