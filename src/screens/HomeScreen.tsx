import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useLayoutEffect, useRef } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDeleteMealPlan } from '@/hooks/useDeleteMealPlan';
import { useMealPlans } from '@/hooks/useMealPlans';
import type { SavedMealPlan } from '@/hooks/useMealPlans';
import { loadOnboardingData } from '@/lib/onboardingStorage';
import type { PlansStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<PlansStackParamList, 'Home'>;

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface PlanCardProps {
  plan: SavedMealPlan;
  onOpen: (plan: SavedMealPlan) => void;
  onDelete: (id: string) => void;
}

function PlanCard({ plan, onOpen, onDelete }: PlanCardProps) {
  const swipeableRef = useRef<InstanceType<typeof ReanimatedSwipeable>>(null);

  function renderRightActions() {
    return (
      <Pressable
        style={styles.deleteAction}
        onPress={() => {
          swipeableRef.current?.close();
          onDelete(plan.id);
        }}>
        <Text style={styles.deleteActionText}>Delete</Text>
      </Pressable>
    );
  }

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      friction={2}
      rightThreshold={60}
      overshootRight={false}>
      <Pressable style={styles.planCard} onPress={() => onOpen(plan)}>
        <View style={styles.planCardHeader}>
          <Text style={styles.planDate}>{formatDate(plan.createdAt)}</Text>
          <Text style={styles.planArrow}>›</Text>
        </View>
        <Text style={styles.planIngredients} numberOfLines={2}>
          {plan.ingredientsInput}
        </Text>
        <Text style={styles.planPreviewText} numberOfLines={1}>
          Mon: {plan.plan.week.monday.lunch} · {plan.plan.week.monday.dinner}
        </Text>
      </Pressable>
    </ReanimatedSwipeable>
  );
}

export function HomeScreen({ navigation }: Props) {
  const { data: plans, isPending } = useMealPlans();
  const { mutate: deletePlan } = useDeleteMealPlan();

  async function handleGenerateNew() {
    const saved = await loadOnboardingData();
    // Input lives in the root stack, above the tab navigator
    (navigation.getParent() as any)?.navigate('Input', {
      householdSize: saved?.householdSize ?? 2,
      preferences: saved?.preferences ?? { dietaryRestrictions: '', cuisineStyle: '' },
    });
  }

  function handleOpenPlan(plan: SavedMealPlan) {
    navigation.navigate('MealPlan', {
      ingredients: plan.ingredientsInput,
      householdSize: 2,
      preferences: { dietaryRestrictions: '', cuisineStyle: '' },
      savedPlan: plan.plan,
    });
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleGenerateNew} hitSlop={12}>
          <Text style={styles.headerAction}>+ New</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {isPending ? (
          <ActivityIndicator color="#208AEF" style={styles.loader} />
        ) : plans && plans.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Your meal plans</Text>
            {plans.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onOpen={handleOpenPlan}
                onDelete={deletePlan}
              />
            ))}
          </>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No meal plans yet.</Text>
            <Text style={styles.emptySubtext}>Tap "+ New" to generate your first weekly plan.</Text>
          </View>
        )}
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
  headerAction: {
    color: '#208AEF',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  loader: {
    marginVertical: 40,
  },
  planCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    gap: 6,
  },
  planCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planDate: {
    fontSize: 15,
    fontWeight: '700',
    color: '#208AEF',
  },
  planArrow: {
    fontSize: 20,
    color: '#208AEF',
    fontWeight: '600',
  },
  planIngredients: {
    fontSize: 13,
    color: '#666',
  },
  planPreviewText: {
    fontSize: 13,
    color: '#333',
  },
  deleteAction: {
    backgroundColor: '#e53e3e',
    justifyContent: 'center',
    alignItems: 'center',
    width: 88,
    borderRadius: 12,
    marginLeft: 8,
  },
  deleteActionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
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
    textAlign: 'center',
  },
});
