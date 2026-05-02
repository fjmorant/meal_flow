import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useExtractIngredients } from '@/hooks/useExtractIngredients';
import type { RootStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Input'>;

export function InputScreen({ route, navigation }: Props) {
  const { householdSize, preferences } = route.params;
  const [ingredients, setIngredients] = useState('');

  const { mutate: extractIngredients, isPending: isExtracting } = useExtractIngredients();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.closeButton}>✕</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  function handleGenerate() {
    if (!ingredients.trim()) return;
    // MealPlan lives in PlansStack → Plans tab → MainTabs
    (navigation as any).navigate('MainTabs', {
      screen: 'Plans',
      params: {
        screen: 'MealPlan',
        params: { ingredients: ingredients.trim(), householdSize, preferences },
      },
    });
  }

  async function handlePickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
    });

    if (result.canceled || !result.assets[0].base64) return;

    const asset = result.assets[0];
    const mediaType = asset.mimeType ?? 'image/jpeg';

    extractIngredients(
      { fileBase64: asset.base64!, mediaType },
      {
        onSuccess: extracted => setIngredients(prev => prev ? `${prev}, ${extracted}` : extracted),
        onError: () => Alert.alert('Error', 'Could not extract ingredients from the photo.'),
      }
    );
  }

  async function handlePickInvoice() {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const fileBase64 = await FileSystem.readAsStringAsync(asset.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const mediaType = asset.mimeType ?? 'image/jpeg';

    extractIngredients(
      { fileBase64, mediaType },
      {
        onSuccess: extracted => setIngredients(prev => prev ? `${prev}, ${extracted}` : extracted),
        onError: () => Alert.alert('Error', 'Could not extract ingredients from the file.'),
      }
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Text style={styles.title}>What ingredients do you already have?</Text>
      <Text style={styles.subtitle}>List what's in your fridge and pantry</Text>

      <View style={styles.importRow}>
        <Pressable style={styles.importButton} onPress={handlePickPhoto} disabled={isExtracting}>
          <Text style={styles.importButtonText}>From photo</Text>
        </Pressable>
        <Pressable style={styles.importButton} onPress={handlePickInvoice} disabled={isExtracting}>
          <Text style={styles.importButtonText}>From invoice</Text>
        </Pressable>
      </View>

      {isExtracting && (
        <View style={styles.extractingRow}>
          <ActivityIndicator size="small" color="#208AEF" />
          <Text style={styles.extractingText}>Extracting ingredients...</Text>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="e.g. chicken, rice, tomatoes, onions, olive oil..."
        placeholderTextColor="#999"
        value={ingredients}
        onChangeText={setIngredients}
        multiline
        textAlignVertical="top"
      />

      <View style={styles.footer}>
        <Pressable
          style={[styles.button, !ingredients.trim() && styles.buttonDisabled]}
          onPress={handleGenerate}
          disabled={!ingredients.trim()}>
          <Text style={styles.buttonText}>Generate weekly plan</Text>
        </Pressable>
      </View>
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
    padding: 24,
    gap: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
  },
  importRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
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
    paddingVertical: 4,
  },
  extractingText: {
    fontSize: 14,
    color: '#666',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
  },
  footer: {
    paddingTop: 16,
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
});
