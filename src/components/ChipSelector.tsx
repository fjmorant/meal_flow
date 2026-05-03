import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  options: string[];
  labels?: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  multiSelect?: boolean;
}

export function ChipSelector({ options, labels, selected, onChange, multiSelect = false }: Props) {
  function toggle(option: string) {
    if (!multiSelect) {
      onChange([option]);
      return;
    }
    const isNeutral = option === 'None' || option === 'Any';
    if (isNeutral) {
      onChange([option]);
      return;
    }
    const withoutNeutral = selected.filter(s => s !== 'None' && s !== 'Any');
    if (withoutNeutral.includes(option)) {
      const next = withoutNeutral.filter(s => s !== option);
      onChange(next.length === 0 ? ['None'] : next);
    } else {
      onChange([...withoutNeutral, option]);
    }
  }

  return (
    <View style={styles.row}>
      {options.map((option, i) => {
        const active = selected.includes(option);
        return (
          <Pressable
            key={option}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => toggle(option)}>
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {labels ? labels[i] : option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  chipActive: {
    borderColor: '#208AEF',
    backgroundColor: '#208AEF',
  },
  chipText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});
