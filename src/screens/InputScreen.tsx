import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Input'>;

export function InputScreen({ route, navigation }: Props) {
  const { householdSize, preferences } = route.params;
  const [ingredients, setIngredients] = useState('');

  function handleGenerate() {
    if (!ingredients.trim()) return;
    navigation.navigate('MealPlan', { ingredients: ingredients.trim(), householdSize, preferences });
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>What ingredients do you already have?</Text>
      <Text style={styles.subtitle}>List what's in your fridge and pantry</Text>

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
