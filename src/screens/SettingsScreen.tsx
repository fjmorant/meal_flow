import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChipSelector } from '@/components/ChipSelector';
import { useTranslation } from '@/contexts/LanguageContext';
import {
  BUDGET_OPTIONS,
  COOKING_TIME_LABELS,
  COOKING_TIME_OPTIONS,
  CUISINE_OPTIONS,
  DIETARY_OPTIONS,
  HEALTH_GOAL_OPTIONS,
} from '@/lib/i18n';
import { loadOnboardingData, saveOnboardingData } from '@/lib/onboardingStorage';

export function SettingsScreen() {
  const { t } = useTranslation();
  const [householdSize, setHouseholdSize] = useState(2);
  const [dietarySelected, setDietarySelected] = useState<string[]>(['None']);
  const [cuisineSelected, setCuisineSelected] = useState<string[]>(['Any']);
  const [cookingTimeSelected, setCookingTimeSelected] = useState<string[]>(['Any']);
  const [budgetSelected, setBudgetSelected] = useState<string[]>(['Any']);
  const [healthGoalSelected, setHealthGoalSelected] = useState<string[]>(['Any']);

  useEffect(() => {
    loadOnboardingData().then(data => {
      if (!data) return;
      setHouseholdSize(data.householdSize);
      const dietary = data.preferences.dietaryRestrictions
        ? data.preferences.dietaryRestrictions.split(', ')
        : ['None'];
      setDietarySelected(dietary);
      setCuisineSelected([data.preferences.cuisineStyle || 'Any']);
      setCookingTimeSelected([data.preferences.cookingTime || 'Any']);
      setBudgetSelected([data.preferences.budget || 'Any']);
      setHealthGoalSelected([data.preferences.healthGoal || 'Any']);
    });
  }, []);

  async function handleSave() {
    const dietaryRestrictions = dietarySelected.filter(s => s !== 'None').join(', ');
    const cuisineStyle = cuisineSelected[0] === 'Any' ? '' : cuisineSelected[0];
    const cookingTime = cookingTimeSelected[0] === 'Any' ? '' : cookingTimeSelected[0];
    const budget = budgetSelected[0] === 'Any' ? '' : budgetSelected[0];
    const healthGoal = healthGoalSelected[0] === 'Any' ? '' : healthGoalSelected[0];
    await saveOnboardingData({
      householdSize,
      preferences: { dietaryRestrictions, cuisineStyle, cookingTime, budget, healthGoal },
    });
    Alert.alert(t('savedTitle'), t('savedMessage'));
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.field}>
          <Text style={styles.label}>{t('householdSize')}</Text>
          <View style={styles.stepper}>
            <Pressable style={styles.stepButton} onPress={() => setHouseholdSize(n => Math.max(1, n - 1))}>
              <Text style={styles.stepButtonText}>−</Text>
            </Pressable>
            <Text style={styles.stepValue}>{householdSize}</Text>
            <Pressable style={styles.stepButton} onPress={() => setHouseholdSize(n => Math.min(10, n + 1))}>
              <Text style={styles.stepButtonText}>+</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t('dietaryRestrictions')}</Text>
          <ChipSelector
            options={DIETARY_OPTIONS}
            selected={dietarySelected}
            onChange={setDietarySelected}
            multiSelect
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t('cuisineStyle')}</Text>
          <ChipSelector
            options={CUISINE_OPTIONS}
            selected={cuisineSelected}
            onChange={setCuisineSelected}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t('cookingTime')}</Text>
          <ChipSelector
            options={COOKING_TIME_OPTIONS}
            labels={COOKING_TIME_LABELS}
            selected={cookingTimeSelected}
            onChange={setCookingTimeSelected}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t('budget')}</Text>
          <ChipSelector
            options={BUDGET_OPTIONS}
            selected={budgetSelected}
            onChange={setBudgetSelected}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t('healthGoal')}</Text>
          <ChipSelector
            options={HEALTH_GOAL_OPTIONS}
            selected={healthGoalSelected}
            onChange={setHealthGoalSelected}
          />
        </View>

        <Pressable style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>{t('savePreferences')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    padding: 24,
    gap: 24,
  },
  field: {
    gap: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  stepValue: {
    fontSize: 20,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
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
