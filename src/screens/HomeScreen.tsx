import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLastMealPlan } from '@/hooks/useLastMealPlan';
import { loadOnboardingData } from '@/lib/onboardingStorage';
import { DAYS } from '@/types/mealPlan';
import type { RootStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { data: lastPlan, isPending } = useLastMealPlan();

  async function handleGenerateNew() {
    const saved = await loadOnboardingData();
    navigation.navigate('Input', {
      householdSize: saved?.householdSize ?? 2,
      preferences: saved?.preferences ?? { dietaryRestrictions: '', cuisineStyle: '' },
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>MealFlow</Text>
          <Pressable onPress={() => navigation.navigate('Onboarding')} hitSlop={12}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </Pressable>
        </View>

        {isPending ? (
          <ActivityIndicator color="#208AEF" style={styles.loader} />
        ) : lastPlan ? (
          <>
            <Text style={styles.sectionTitle}>This week</Text>
            {DAYS.map(day => (
              <Pressable
                key={day}
                style={styles.dayCard}
                onPress={() =>
                  navigation.navigate('MealPlan', {
                    ingredients: lastPlan.ingredientsInput,
                    householdSize: 2,
                    preferences: { dietaryRestrictions: '', cuisineStyle: '' },
                  })
                }>
                <Text style={styles.dayName}>
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </Text>
                <View style={styles.meals}>
                  <Text style={styles.mealText} numberOfLines={1}>
                    🍽 {lastPlan.plan.week[day].lunch}
                  </Text>
                  <Text style={styles.mealText} numberOfLines={1}>
                    🌙 {lastPlan.plan.week[day].dinner}
                  </Text>
                </View>
              </Pressable>
            ))}
          </>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No meal plan yet.</Text>
            <Text style={styles.emptySubtext}>Generate your first weekly plan below.</Text>
          </View>
        )}

        <Pressable style={styles.button} onPress={handleGenerateNew}>
          <Text style={styles.buttonText}>
            {lastPlan ? 'Generate new plan' : 'Generate my first plan'}
          </Text>
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
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  settingsIcon: {
    fontSize: 22,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  loader: {
    marginVertical: 40,
  },
  dayCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    gap: 6,
  },
  dayName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#208AEF',
  },
  meals: {
    gap: 2,
  },
  mealText: {
    fontSize: 14,
    color: '#333',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
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
