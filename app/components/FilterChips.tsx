import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../data/theme';

interface FilterChip {
  label: string;
  value: string;
  icon?: string;
  color?: string;
}

interface FilterChipsProps {
  chips: FilterChip[];
  selected: string;
  onSelect: (value: string) => void;
}

export default function FilterChips({ chips, selected, onSelect }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {chips.map((chip) => {
        const isSelected = selected === chip.value;
        return (
          <TouchableOpacity
            key={chip.value}
            style={[
              styles.chip,
              isSelected && styles.chipSelected,
              isSelected && chip.color ? { backgroundColor: chip.color } : {},
            ]}
            onPress={() => onSelect(chip.value)}
            activeOpacity={0.7}
          >
            {chip.icon && (
              <Ionicons
                name={chip.icon as any}
                size={14}
                color={isSelected ? COLORS.white : COLORS.textLight}
                style={{ marginRight: 4 }}
              />
            )}
            <Text
              style={[
                styles.chipText,
                isSelected && styles.chipTextSelected,
              ]}
            >
              {chip.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    marginRight: SPACING.sm,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  chipTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
});
