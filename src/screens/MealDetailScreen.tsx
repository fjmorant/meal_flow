import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTranslation } from '@/contexts/LanguageContext';
import { useMealRecipe } from '@/hooks/useMealRecipe';
import type { PlansStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<PlansStackParamList, 'MealDetail'>;

export function MealDetailScreen({ route }: Props) {
  const { mealName, householdSize } = route.params;
  const { t } = useTranslation();
  const { data: recipe, isPending, isError, refetch } = useMealRecipe({ mealName, servings: householdSize });

  if (isPending) {
    return (
      <SafeAreaView style={styles.centered} edges={['bottom']}>
        <ActivityIndicator size="large" color="#208AEF" />
        <Text style={styles.loadingText}>{t('fetchingRecipe')}</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.centered} edges={['bottom']}>
        <Text style={styles.errorText}>{t('couldNotLoadRecipe')}</Text>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>{t('retry')}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.timesRow}>
          <View style={styles.timeChip}>
            <Text style={styles.timeLabel}>{t('prep')}</Text>
            <Text style={styles.timeValue}>{recipe.prep_time}</Text>
          </View>
          <View style={styles.timeChip}>
            <Text style={styles.timeLabel}>{t('cook')}</Text>
            <Text style={styles.timeValue}>{recipe.cook_time}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('ingredients')}</Text>
        <View style={styles.card}>
          {recipe.ingredients.map((item, i) => (
            <Text key={i} style={styles.ingredient}>• {item}</Text>
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('steps')}</Text>
        <View style={styles.card}>
          {recipe.steps.map((step, i) => (
            <View key={i} style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
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
    backgroundColor: '#fff',
  },
  scroll: {
    padding: 24,
    gap: 16,
  },
  timesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeChip: {
    flex: 1,
    backgroundColor: '#EEF6FF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 2,
  },
  timeLabel: {
    fontSize: 12,
    color: '#208AEF',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  ingredient: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  step: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#208AEF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
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
  retryButton: {
    backgroundColor: '#208AEF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
