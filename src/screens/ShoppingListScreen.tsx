import { useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useShoppingList } from '@/contexts/ShoppingListContext';
import type { ShoppingItem } from '@/contexts/ShoppingListContext';

const CATEGORY_LABELS: Record<ShoppingItem['category'], string> = {
  vegetables: 'Vegetables',
  proteins: 'Proteins',
  other: 'Other',
};

const CATEGORY_ORDER: ShoppingItem['category'][] = ['vegetables', 'proteins', 'other'];

export function ShoppingListScreen() {
  const { items, isLoaded, addManual, toggleItem, removeChecked, clearAll } = useShoppingList();
  const [showChecked, setShowChecked] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<TextInput>(null);

  const checkedCount = items.filter(i => i.checked).length;

  const sections = CATEGORY_ORDER
    .map(cat => ({
      category: cat,
      title: CATEGORY_LABELS[cat],
      data: items.filter(i => i.category === cat && (showChecked || !i.checked)),
    }))
    .filter(s => s.data.length > 0);

  function handleAdd() {
    if (!inputValue.trim()) return;
    addManual(inputValue.trim());
    setInputValue('');
    inputRef.current?.focus();
  }

  function handleClearChecked() {
    Alert.alert('Remove checked items?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: removeChecked },
    ]);
  }

  function handleClearAll() {
    Alert.alert('Clear shopping list?', 'All items will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear all', style: 'destructive', onPress: clearAll },
    ]);
  }

  if (!isLoaded) return null;

  const isEmpty = items.length === 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Manual add input — always visible */}
      <View style={styles.addRow}>
        <TextInput
          ref={inputRef}
          style={styles.addInput}
          placeholder="Add an item…"
          placeholderTextColor="#bbb"
          value={inputValue}
          onChangeText={setInputValue}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
          blurOnSubmit={false}
        />
        <Pressable
          style={[styles.addButton, !inputValue.trim() && styles.addButtonDisabled]}
          onPress={handleAdd}
          disabled={!inputValue.trim()}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      {isEmpty ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Your list is empty</Text>
          <Text style={styles.emptySubtitle}>
            Add items above or tap + on any ingredient in a meal plan.
          </Text>
        </View>
      ) : (
        <>
          {checkedCount > 0 && (
            <View style={styles.toolbar}>
              <Pressable onPress={() => setShowChecked(v => !v)}>
                <Text style={styles.toolbarButton}>
                  {showChecked ? 'Hide checked' : `Show checked (${checkedCount})`}
                </Text>
              </Pressable>
              <Pressable onPress={handleClearChecked}>
                <Text style={[styles.toolbarButton, styles.toolbarDestructive]}>
                  Remove checked
                </Text>
              </Pressable>
            </View>
          )}

          <SectionList
            sections={sections}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            stickySectionHeadersEnabled={false}
            renderSectionHeader={({ section }) => (
              <Text style={styles.sectionHeader}>{section.title}</Text>
            )}
            renderItem={({ item }) => (
              <Pressable style={styles.row} onPress={() => toggleItem(item.id)}>
                <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
                  {item.checked && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>
                  {item.name}
                </Text>
              </Pressable>
            )}
            renderSectionFooter={() => <View style={styles.sectionGap} />}
            ListFooterComponent={
              <Pressable onPress={handleClearAll} style={styles.clearAllRow}>
                <Text style={styles.clearAllText}>Clear all</Text>
              </Pressable>
            }
          />

          {checkedCount > 0 && (
            <View style={styles.footer}>
              <Pressable style={styles.clearButton} onPress={handleClearChecked}>
                <Text style={styles.clearButtonText}>
                  Remove {checkedCount} checked item{checkedCount > 1 ? 's' : ''}
                </Text>
              </Pressable>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  addRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  addInput: {
    flex: 1,
    height: 44,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#111',
  },
  addButton: {
    backgroundColor: '#208AEF',
    borderRadius: 10,
    paddingHorizontal: 18,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#a0c8f5',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  toolbarButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#208AEF',
  },
  toolbarDestructive: {
    color: '#e53e3e',
  },
  list: {
    padding: 20,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  sectionGap: {
    height: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#208AEF',
    borderColor: '#208AEF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  itemName: {
    fontSize: 16,
    color: '#111',
    flex: 1,
  },
  itemNameChecked: {
    color: '#bbb',
    textDecorationLine: 'line-through',
  },
  clearAllRow: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  clearAllText: {
    fontSize: 14,
    color: '#ccc',
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  clearButton: {
    backgroundColor: '#fff0f0',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#e53e3e',
    fontSize: 15,
    fontWeight: '600',
  },
});
