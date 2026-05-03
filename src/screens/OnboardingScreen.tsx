import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChipSelector } from '@/components/ChipSelector';
import { useTranslation } from '@/contexts/LanguageContext';
import { CUISINE_OPTIONS, DIETARY_OPTIONS } from '@/lib/i18n';
import { saveOnboardingData } from '@/lib/onboardingStorage';
import type { RootStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export function OnboardingScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [householdSize, setHouseholdSize] = useState(2);
  const [dietarySelected, setDietarySelected] = useState<string[]>(['None']);
  const [cuisineSelected, setCuisineSelected] = useState<string[]>(['Any']);

  async function handleContinue() {
    const dietaryRestrictions = dietarySelected.filter(s => s !== 'None').join(', ');
    const cuisineStyle = cuisineSelected[0] === 'Any' ? '' : cuisineSelected[0];
    await saveOnboardingData({ householdSize, preferences: { dietaryRestrictions, cuisineStyle } });
    navigation.replace('MainTabs');
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('welcomeTitle')}</Text>
        <Text style={styles.subtitle}>{t('welcomeSubtitle')}</Text>

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

        <Pressable style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>{t('getStarted')}</Text>
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
