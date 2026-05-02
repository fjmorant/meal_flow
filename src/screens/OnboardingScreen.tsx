import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLastMealPlan } from '@/hooks/useLastMealPlan';
import { saveOnboardingData } from '@/lib/onboardingStorage';
import type { RootStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export function OnboardingScreen({ navigation }: Props) {
  const [householdSize, setHouseholdSize] = useState(2);
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [cuisineStyle, setCuisineStyle] = useState('');

  const { data: lastPlan, isPending: loadingLastPlan } = useLastMealPlan();

  async function handleContinue() {
    const data = { householdSize, preferences: { dietaryRestrictions, cuisineStyle } };
    await saveOnboardingData(data);
    navigation.navigate('Home');
  }

  function handleViewLastPlan() {
    if (!lastPlan) return;
    navigation.navigate('MealPlan', {
      ingredients: lastPlan.ingredientsInput,
      householdSize,
      preferences: { dietaryRestrictions, cuisineStyle },
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Welcome to MealFlow</Text>
      <Text style={styles.subtitle}>Let's set up your meal plan</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Household size</Text>
        <View style={styles.stepper}>
          <Pressable
            style={styles.stepButton}
            onPress={() => setHouseholdSize(n => Math.max(1, n - 1))}>
            <Text style={styles.stepButtonText}>−</Text>
          </Pressable>
          <Text style={styles.stepValue}>{householdSize}</Text>
          <Pressable
            style={styles.stepButton}
            onPress={() => setHouseholdSize(n => Math.min(10, n + 1))}>
            <Text style={styles.stepButtonText}>+</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Dietary restrictions</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. vegetarian, no nuts, gluten-free"
          value={dietaryRestrictions}
          onChangeText={setDietaryRestrictions}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Cuisine style</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Mediterranean, Asian, anything"
          value={cuisineStyle}
          onChangeText={setCuisineStyle}
        />
      </View>

      <View style={styles.footer}>
        {loadingLastPlan ? (
          <ActivityIndicator color="#208AEF" />
        ) : lastPlan ? (
          <Pressable style={styles.secondaryButton} onPress={handleViewLastPlan}>
            <Text style={styles.secondaryButtonText}>View last plan</Text>
          </Pressable>
        ) : null}

        <Pressable style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: -16,
  },
  field: {
    gap: 8,
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  footer: {
    marginTop: 'auto',
    gap: 12,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#208AEF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#208AEF',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#208AEF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
