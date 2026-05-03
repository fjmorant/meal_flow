import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChipSelector } from '@/components/ChipSelector';
import { useTranslation } from '@/contexts/LanguageContext';
import { CUISINE_LABELS, CUISINE_OPTIONS, DIETARY_LABELS, DIETARY_OPTIONS } from '@/lib/i18n';
import { loadOnboardingData, saveOnboardingData } from '@/lib/onboardingStorage';

export function SettingsScreen() {
  const { t, language, setLanguage } = useTranslation();
  const dietaryLabels = DIETARY_LABELS[language];
  const cuisineLabels = CUISINE_LABELS[language];
  const [householdSize, setHouseholdSize] = useState(2);
  const [dietarySelected, setDietarySelected] = useState<string[]>(['None']);
  const [cuisineSelected, setCuisineSelected] = useState<string[]>(['Any']);

  useEffect(() => {
    loadOnboardingData().then(data => {
      if (!data) return;
      setHouseholdSize(data.householdSize);
      const dietary = data.preferences.dietaryRestrictions
        ? data.preferences.dietaryRestrictions.split(', ')
        : ['None'];
      setDietarySelected(dietary);
      setCuisineSelected([data.preferences.cuisineStyle || 'Any']);
    });
  }, []);

  async function handleSave() {
    const dietaryRestrictions = dietarySelected.filter(s => s !== 'None').join(', ');
    const cuisineStyle = cuisineSelected[0] === 'Any' ? '' : cuisineSelected[0];
    await saveOnboardingData({ householdSize, preferences: { dietaryRestrictions, cuisineStyle } });
    Alert.alert(t('savedTitle'), t('savedMessage'));
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.field}>
          <Text style={styles.label}>{t('language')}</Text>
          <View style={styles.langRow}>
            {(['en', 'es'] as Language[]).map(lang => (
              <Pressable
                key={lang}
                style={[styles.langButton, language === lang && styles.langButtonActive]}
                onPress={() => setLanguage(lang)}>
                <Text style={[styles.langButtonText, language === lang && styles.langButtonTextActive]}>
                  {lang === 'en' ? 'English' : 'Español'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

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
            labels={dietaryLabels}
            selected={dietarySelected}
            onChange={setDietarySelected}
            multiSelect
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t('cuisineStyle')}</Text>
          <ChipSelector
            options={CUISINE_OPTIONS}
            labels={cuisineLabels}
            selected={cuisineSelected}
            onChange={setCuisineSelected}
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
  langRow: {
    flexDirection: 'row',
    gap: 10,
  },
  langButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  langButtonActive: {
    backgroundColor: '#208AEF',
    borderColor: '#208AEF',
  },
  langButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555',
  },
  langButtonTextActive: {
    color: '#fff',
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
