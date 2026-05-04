import { CommonActions } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
const TOTAL_STEPS = 2;

export function InputScreen({ route, navigation }: Props) {
  const { householdSize: savedHouseholdSize, preferences: savedPreferences, mode } = route.params;
  const { t } = useTranslation();
  const isScratch = mode === 'scratch';

  const [step, setStep] = useState(0);
  const isLastStep = step === TOTAL_STEPS - 1;

  const [planName, setPlanName] = useState('');

  // Ingredient state
  const [ingredients, setIngredients] = useState('');
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [photos, setPhotos] = useState<{ uri: string; base64: string; mimeType: string }[]>([]);

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
  const isBusy = isExtracting || isReadingFile || isCompressing;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: step > 0
        ? () => (
            <Pressable onPress={() => setStep(s => s - 1)} hitSlop={12}>
              <Text style={styles.backButton}>← Back</Text>
            </Pressable>
          )
        : undefined,
      headerRight: () => (
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.closeButton}>✕</Text>
        </Pressable>
      ),
    });
  }, [navigation, step]);

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
                          planName: planName.trim() || undefined,
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
    dispatchToMealPlan(isScratch ? '' : ingredients.trim());
  }

  // ── Photo helpers ──────────────────────────────────────────────

  async function compressPhoto(uri: string) {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    return { uri: result.uri, base64: result.base64!, mimeType: 'image/jpeg' };
  }

  async function handleCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (result.canceled || !result.assets[0]) return;
    setIsCompressing(true);
    try {
      const compressed = await compressPhoto(result.assets[0].uri);
      setPhotos(prev => [...prev, compressed]);
    } finally {
      setIsCompressing(false);
    }
  }

  async function handlePickPhotos() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (result.canceled || !result.assets.length) return;
    setIsCompressing(true);
    try {
      const compressed = await Promise.all(result.assets.map(a => compressPhoto(a.uri)));
      setPhotos(prev => [...prev, ...compressed]);
    } finally {
      setIsCompressing(false);
    }
  }

  function handleExtractFromPhotos() {
    extractIngredients(
      { files: photos.map(p => ({ fileBase64: p.base64, mediaType: p.mimeType })) },
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
      } catch {
        Alert.alert(t('errorGeneric'), t('errorReadFile'));
        return;
      } finally {
        setIsReadingFile(false);
      }

      const mediaType = asset.mimeType ?? 'application/pdf';
      extractIngredients(
        { files: [{ fileBase64, mediaType }] },
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

  // ── Step content ──────────────────────────────────────────────

  // Ingredients mode — step 0
  function renderIngredientsStep() {
    return (
      <>
        <View style={styles.header}>
          <Text style={styles.title}>{t('whatIngredients')}</Text>
          <Text style={styles.subtitle}>{t('whatIngredientsSubtitle')}</Text>
        </View>

        <TextInput
          style={styles.nameInput}
          placeholder="Plan name (optional)"
          placeholderTextColor="#bbb"
          value={planName}
          onChangeText={setPlanName}
          returnKeyType="done"
          maxLength={60}
        />

        <View style={styles.importRow}>
          <Pressable style={styles.importButton} onPress={handleCamera} disabled={isBusy}>
            <Text style={styles.importButtonText}>Camera</Text>
          </Pressable>
          <Pressable style={styles.importButton} onPress={handlePickPhotos} disabled={isBusy}>
            <Text style={styles.importButtonText}>Gallery</Text>
          </Pressable>
          <Pressable style={styles.importButton} onPress={handlePickInvoice} disabled={isBusy}>
            <Text style={styles.importButtonText}>{t('fromInvoice')}</Text>
          </Pressable>
        </View>

        {photos.length > 0 && (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photosRow}>
              {photos.map((photo, i) => (
                <View key={i} style={styles.photoThumb}>
                  <Image source={{ uri: photo.uri }} style={styles.thumbImage} />
                  <Pressable
                    style={styles.removePhoto}
                    onPress={() => setPhotos(prev => prev.filter((_, j) => j !== i))}>
                    <Text style={styles.removePhotoText}>✕</Text>
                  </Pressable>
                </View>
              ))}
            </ScrollView>

            <Pressable
              style={[styles.analyzeButton, isBusy && styles.analyzeButtonDisabled]}
              onPress={handleExtractFromPhotos}
              disabled={isBusy}>
              {isExtracting || isCompressing ? (
                <ActivityIndicator size="small" color="#208AEF" />
              ) : (
                <Text style={styles.analyzeButtonText}>
                  Analyze {photos.length} photo{photos.length > 1 ? 's' : ''} →
                </Text>
              )}
            </Pressable>
          </>
        )}

        {isReadingFile && (
          <View style={styles.extractingRow}>
            <ActivityIndicator size="small" color="#208AEF" />
            <Text style={styles.extractingText}>{t('readingFile')}</Text>
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
    );
  }

  // Ingredients mode — step 1
  function renderPreferencesStep() {
    return (
      <>
        <View style={styles.header}>
          <Text style={styles.title}>Preferences</Text>
          <Text style={styles.subtitle}>Customize the plan for your household.</Text>
        </View>

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
          <ChipSelector options={DIETARY_OPTIONS} selected={dietarySelected} onChange={setDietarySelected} multiSelect />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{t('cuisineStyle')}</Text>
          <ChipSelector options={CUISINE_OPTIONS} selected={cuisineSelected} onChange={setCuisineSelected} />
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
          <ChipSelector options={BUDGET_OPTIONS} selected={budgetSelected} onChange={setBudgetSelected} />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{t('healthGoal')}</Text>
          <ChipSelector options={HEALTH_GOAL_OPTIONS} selected={healthGoalSelected} onChange={setHealthGoalSelected} />
        </View>
      </>
    );
  }

  // Scratch mode — step 0
  function renderWhoStep() {
    return (
      <>
        <View style={styles.header}>
          <Text style={styles.title}>Who's eating?</Text>
          <Text style={styles.subtitle}>We'll scale portions and respect dietary needs.</Text>
        </View>

        <TextInput
          style={styles.nameInput}
          placeholder="Plan name (optional)"
          placeholderTextColor="#bbb"
          value={planName}
          onChangeText={setPlanName}
          returnKeyType="done"
          maxLength={60}
        />

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
          <ChipSelector options={DIETARY_OPTIONS} selected={dietarySelected} onChange={setDietarySelected} multiSelect />
        </View>
      </>
    );
  }

  // Scratch mode — step 1
  function renderStyleStep() {
    return (
      <>
        <View style={styles.header}>
          <Text style={styles.title}>What kind of meals?</Text>
          <Text style={styles.subtitle}>Set your cooking style and goals for the week.</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{t('cuisineStyle')}</Text>
          <ChipSelector options={CUISINE_OPTIONS} selected={cuisineSelected} onChange={setCuisineSelected} />
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
          <ChipSelector options={BUDGET_OPTIONS} selected={budgetSelected} onChange={setBudgetSelected} />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{t('healthGoal')}</Text>
          <ChipSelector options={HEALTH_GOAL_OPTIONS} selected={healthGoalSelected} onChange={setHealthGoalSelected} />
        </View>
      </>
    );
  }

  function renderCurrentStep() {
    if (isScratch) {
      return step === 0 ? renderWhoStep() : renderStyleStep();
    }
    return step === 0 ? renderIngredientsStep() : renderPreferencesStep();
  }

  const canNext = isScratch ? true : !!ingredients.trim();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>

        {isLastStep ? (
          <Pressable style={styles.button} onPress={handleGenerate}>
            <Text style={styles.buttonText}>{t('generateWeeklyPlan')}</Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.button, (!canNext || isBusy) && styles.buttonDisabled]}
            onPress={() => setStep(s => s + 1)}
            disabled={!canNext || isBusy}>
            <Text style={styles.buttonText}>Next</Text>
          </Pressable>
        )}
      </View>

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
  backButton: {
    fontSize: 16,
    color: '#208AEF',
    fontWeight: '500',
  },
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
    gap: 20,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
  },
  nameInput: {
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#111',
  },
  importRow: {
    flexDirection: 'row',
    gap: 8,
  },
  importButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#208AEF',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  importButtonText: {
    color: '#208AEF',
    fontSize: 14,
    fontWeight: '600',
  },
  photosRow: {
    gap: 8,
    paddingVertical: 2,
  },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbImage: {
    width: 80,
    height: 80,
  },
  removePhoto: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePhotoText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  analyzeButton: {
    borderWidth: 1.5,
    borderColor: '#208AEF',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  analyzeButtonDisabled: {
    borderColor: '#a0c8f5',
  },
  analyzeButtonText: {
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
  footer: {
    padding: 24,
    paddingTop: 16,
    gap: 14,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ddd',
  },
  dotActive: {
    width: 20,
    backgroundColor: '#208AEF',
  },
  button: {
    backgroundColor: '#208AEF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
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
