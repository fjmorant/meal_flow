import { CommonActions } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  InputAccessoryView,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChipSelector } from '@/components/ChipSelector';
import { useTranslation } from '@/contexts/LanguageContext';
import { useExtractIngredients } from '@/hooks/useExtractIngredients';
import {
  BUDGET_OPTIONS,
  COOKING_TIME_LABELS,
  COOKING_TIME_OPTIONS,
  CUISINE_OPTIONS,
  DIETARY_OPTIONS,
  HEALTH_GOAL_OPTIONS,
} from '@/lib/i18n';
import type { RootStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Input'>;

const INPUT_ACCESSORY_ID = 'ingredients-input';

export function InputScreen({ route, navigation }: Props) {
  const { householdSize: savedHouseholdSize, preferences: savedPreferences, mode } = route.params;
  const { t } = useTranslation();
  const isScratch = mode === 'scratch';

  // Ingredient state
  const [ingredients, setIngredients] = useState('');
  const [isReadingFile, setIsReadingFile] = useState(false);

  // Per-plan preference state — initialized from saved prefs, overridable for this plan
  const [householdSize, setHouseholdSize] = useState(savedHouseholdSize);
  const [dietarySelected, setDietarySelected] = useState<string[]>(
    savedPreferences.dietaryRestrictions ? savedPreferences.dietaryRestrictions.split(', ') : ['None']
  );
  const [cuisineSelected, setCuisineSelected] = useState<string[]>([savedPreferences.cuisineStyle || 'Any']);
  const [cookingTimeSelected, setCookingTimeSelected] = useState<string[]>([savedPreferences.cookingTime || 'Any']);
  const [budgetSelected, setBudgetSelected] = useState<string[]>([savedPreferences.budget || 'Any']);
  const [healthGoalSelected, setHealthGoalSelected] = useState<string[]>([savedPreferences.healthGoal || 'Any']);

  const { mutate: extractIngredients, isPending: isExtracting } = useExtractIngredients();
  const isBusy = isExtracting || isReadingFile;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.closeButton}>✕</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  function buildPreferences() {
    return {
      dietaryRestrictions: dietarySelected.filter(s => s !== 'None').join(', '),
      cuisineStyle: cuisineSelected[0] === 'Any' ? '' : cuisineSelected[0],
      cookingTime: cookingTimeSelected[0] === 'Any' ? '' : cookingTimeSelected[0],
      budget: budgetSelected[0] === 'Any' ? '' : budgetSelected[0],
      healthGoal: healthGoalSelected[0] === 'Any' ? '' : healthGoalSelected[0],
    };
  }

  function dispatchToMealPlan(ingredientsValue: string) {
    // Reset root stack to [MainTabs] with Plans stack seeded as [Home, MealPlan].
    // This atomically dismisses the modal and ensures Home sits below MealPlan so
    // goBack() on MealPlan lands on Home with no back button on Home itself.
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'MainTabs',
            state: {
              index: 0,
              routes: [
                {
                  name: 'Plans',
                  state: {
                    index: 1,
                    routes: [
                      { name: 'Home' },
                      {
                        name: 'MealPlan',
                        params: {
                          ingredients: ingredientsValue,
                          householdSize,
                          preferences: buildPreferences(),
                          mode,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      })
    );
  }

  function handleGenerate() {
    if (isScratch) {
      dispatchToMealPlan('');
    } else {
      if (!ingredients.trim()) return;
      dispatchToMealPlan(ingredients.trim());
    }
  }

  async function handlePickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
    });

    if (result.canceled || !result.assets[0]?.base64) return;

    const asset = result.assets[0];
    extractIngredients(
      { fileBase64: asset.base64!, mediaType: asset.mimeType ?? 'image/jpeg' },
      {
        onSuccess: extracted => setIngredients(prev => prev ? `${prev}, ${extracted}` : extracted),
        onError: () => Alert.alert(t('errorGeneric'), t('errorExtractPhoto')),
      }
    );
  }

  async function handlePickInvoice() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      setIsReadingFile(true);

      let fileBase64: string;
      try {
        // fetch + FileReader handles iOS security-scoped URIs that FileSystem cannot read directly
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        fileBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            resolve(dataUrl.replace(/^data:.+;base64,/, ''));
          };
          reader.onerror = () => reject(new Error('FileReader failed'));
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        Alert.alert(t('errorGeneric'), t('errorReadFile'));
        return;
      } finally {
        setIsReadingFile(false);
      }

      const mediaType = asset.mimeType ?? 'application/pdf';
      extractIngredients(
        { fileBase64, mediaType },
        {
          onSuccess: extracted => setIngredients(prev => prev ? `${prev}, ${extracted}` : extracted),
          onError: () => Alert.alert(t('errorGeneric'), t('errorExtractFile')),
        }
      );
    } catch {
      setIsReadingFile(false);
      Alert.alert(t('errorGeneric'), t('errorFilePicker'));
    }
  }

  const canGenerate = isScratch || !!ingredients.trim();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {isScratch ? (
          <>
            <Text style={styles.title}>{t('planYourWeek')}</Text>
            <Text style={styles.subtitle}>{t('planYourWeekSubtitle')}</Text>
          </>
        ) : (
          <>
            <Text style={styles.title}>{t('whatIngredients')}</Text>
            <Text style={styles.subtitle}>{t('whatIngredientsSubtitle')}</Text>

            <View style={styles.importRow}>
              <Pressable style={styles.importButton} onPress={handlePickPhoto} disabled={isBusy}>
                <Text style={styles.importButtonText}>{t('fromPhoto')}</Text>
              </Pressable>
              <Pressable style={styles.importButton} onPress={handlePickInvoice} disabled={isBusy}>
                <Text style={styles.importButtonText}>{t('fromInvoice')}</Text>
              </Pressable>
            </View>

            {isBusy && (
              <View style={styles.extractingRow}>
                <ActivityIndicator size="small" color="#208AEF" />
                <Text style={styles.extractingText}>
                  {isReadingFile ? t('readingFile') : t('extractingIngredients')}
                </Text>
              </View>
            )}

            <TextInput
              style={styles.input}
              placeholder={t('ingredientsPlaceholder')}
              placeholderTextColor="#999"
              value={ingredients}
              onChangeText={setIngredients}
              multiline
              textAlignVertical="top"
              autoFocus={false}
              inputAccessoryViewID={INPUT_ACCESSORY_ID}
            />
          </>
        )}

        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>Preferences for this plan</Text>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{t('householdSize')}</Text>
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
          <Text style={styles.fieldLabel}>{t('dietaryRestrictions')}</Text>
          <ChipSelector
            options={DIETARY_OPTIONS}
            selected={dietarySelected}
            onChange={setDietarySelected}
            multiSelect
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{t('cuisineStyle')}</Text>
          <ChipSelector
            options={CUISINE_OPTIONS}
            selected={cuisineSelected}
            onChange={setCuisineSelected}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{t('cookingTime')}</Text>
          <ChipSelector
            options={COOKING_TIME_OPTIONS}
            labels={COOKING_TIME_LABELS}
            selected={cookingTimeSelected}
            onChange={setCookingTimeSelected}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{t('budget')}</Text>
          <ChipSelector
            options={BUDGET_OPTIONS}
            selected={budgetSelected}
            onChange={setBudgetSelected}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{t('healthGoal')}</Text>
          <ChipSelector
            options={HEALTH_GOAL_OPTIONS}
            selected={healthGoalSelected}
            onChange={setHealthGoalSelected}
          />
        </View>

        <Pressable
          style={[styles.button, !canGenerate && styles.buttonDisabled]}
          onPress={handleGenerate}
          disabled={!canGenerate}>
          <Text style={styles.buttonText}>{t('generateWeeklyPlan')}</Text>
        </Pressable>
      </ScrollView>

      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={INPUT_ACCESSORY_ID}>
          <View style={styles.keyboardToolbar}>
            <Pressable onPress={Keyboard.dismiss} style={styles.doneButton}>
              <Text style={styles.doneButtonText}>{t('done')}</Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
  },
  importRow: {
    flexDirection: 'row',
    gap: 12,
  },
  importButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#208AEF',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  importButtonText: {
    color: '#208AEF',
    fontSize: 15,
    fontWeight: '600',
  },
  extractingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  extractingText: {
    fontSize: 14,
    color: '#666',
  },
  input: {
    height: 120,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 4,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  stepValue: {
    fontSize: 18,
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
  buttonDisabled: {
    backgroundColor: '#a0c8f5',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  keyboardToolbar: {
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
  },
  doneButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  doneButtonText: {
    color: '#208AEF',
    fontSize: 16,
    fontWeight: '600',
  },
});
