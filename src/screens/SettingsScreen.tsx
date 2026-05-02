import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { loadOnboardingData, saveOnboardingData } from '@/lib/onboardingStorage';

export function SettingsScreen() {
  const [householdSize, setHouseholdSize] = useState(2);
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [cuisineStyle, setCuisineStyle] = useState('');

  useEffect(() => {
    loadOnboardingData().then(data => {
      if (data) {
        setHouseholdSize(data.householdSize);
        setDietaryRestrictions(data.preferences.dietaryRestrictions);
        setCuisineStyle(data.preferences.cuisineStyle);
      }
    });
  }, []);

  async function handleSave() {
    await saveOnboardingData({
      householdSize,
      preferences: { dietaryRestrictions, cuisineStyle },
    });
    Alert.alert('Saved', 'Your preferences have been updated.');
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
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
        <Pressable style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save preferences</Text>
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
    backgroundColor: '#fff',
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
