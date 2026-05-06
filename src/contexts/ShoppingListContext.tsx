import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const KEY = 'shopping_list';

export interface ShoppingItem {
  id: string;
  name: string;
  category: 'vegetables' | 'proteins' | 'other';
  checked: boolean;
}

interface ShoppingListContextValue {
  items: ShoppingItem[];
  isLoaded: boolean;
  addItems: (newItems: Omit<ShoppingItem, 'id' | 'checked'>[]) => void;
  addManual: (name: string) => void;
  toggleItem: (id: string) => void;
  removeChecked: () => void;
  clearAll: () => void;
}

const ShoppingListContext = createContext<ShoppingListContextValue | null>(null);

async function persist(items: ShoppingItem[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(items));
}

export function ShoppingListProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      setItems(raw ? (JSON.parse(raw) as ShoppingItem[]) : []);
      setIsLoaded(true);
    });
  }, []);

  const addItems = useCallback((newItems: Omit<ShoppingItem, 'id' | 'checked'>[]) => {
    setItems(prev => {
      const existingNames = new Set(prev.map(i => i.name.toLowerCase()));
      const toAdd = newItems
        .filter(i => !existingNames.has(i.name.toLowerCase()))
        .map(i => ({
          ...i,
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          checked: false,
        }));
      if (!toAdd.length) return prev;
      const next = [...prev, ...toAdd];
      persist(next);
      return next;
    });
  }, []);

  const addManual = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setItems(prev => {
      if (prev.some(i => i.name.toLowerCase() === trimmed.toLowerCase())) return prev;
      const next = [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: trimmed,
          category: 'other' as const,
          checked: false,
        },
      ];
      persist(next);
      return next;
    });
  }, []);

  const toggleItem = useCallback((id: string) => {
    setItems(prev => {
      const next = prev.map(i => (i.id === id ? { ...i, checked: !i.checked } : i));
      persist(next);
      return next;
    });
  }, []);

  const removeChecked = useCallback(() => {
    setItems(prev => {
      const next = prev.filter(i => !i.checked);
      persist(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
    persist([]);
  }, []);

  return (
    <ShoppingListContext.Provider
      value={{ items, isLoaded, addItems, addManual, toggleItem, removeChecked, clearAll }}>
      {children}
    </ShoppingListContext.Provider>
  );
}

export function useShoppingList() {
  const ctx = useContext(ShoppingListContext);
  if (!ctx) throw new Error('useShoppingList must be used inside ShoppingListProvider');
  return ctx;
}
