import { Layout } from '@/constants/theme';
import { useFieldStyle } from '@/hooks/use-surface-style';
import { useTheme } from '@/hooks/use-theme';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

type SearchFieldProps = {
  value?: string;
  onChangeText?: TextInputProps['onChangeText'];
  placeholder?: string;
  onPress?: () => void;
  onFilterPress?: () => void;
  editable?: boolean;
  showFilter?: boolean;
  variant?: 'default' | 'header';
};

export function SearchField({
  value,
  onChangeText,
  placeholder = 'Search services...',
  onPress,
  onFilterPress,
  editable = true,
  showFilter = false,
  variant = 'default',
}: SearchFieldProps) {
  const theme = useTheme();
  const fieldStyle = useFieldStyle();
  const isHeader = variant === 'header';

  const inner = (
    <View
      style={[
        styles.container,
        isHeader ? styles.headerContainer : undefined,
        {
          backgroundColor: isHeader ? theme.card : theme.card,
        },
        isHeader ? undefined : fieldStyle,
      ]}>
      {isHeader ? (
        <Feather name='search' size={18} color={theme.subtext} />
      ) : (
        <View style={[styles.searchIcon, { backgroundColor: theme.muted }]}>
          <Feather name='search' size={16} color={theme.text} />
        </View>
      )}
      {editable && !onPress ? (
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={theme.subtext}
          style={[styles.input, { color: theme.text }]}
          value={value}
          onChangeText={onChangeText}
          returnKeyType='search'
        />
      ) : (
        <Text
          style={[styles.input, { color: value ? theme.text : theme.subtext }]}
          numberOfLines={1}>
          {value || placeholder}
        </Text>
      )}
      {!isHeader && showFilter && onFilterPress ? (
        <Pressable
          onPress={onFilterPress}
          hitSlop={8}
          style={({ pressed }) => [
            styles.filterBtn,
            {
              backgroundColor: theme.text,
              opacity: pressed ? 0.88 : 1,
            },
          ]}>
          <Feather name='sliders' size={14} color={theme.onAccent} />
        </Pressable>
      ) : null}
      {editable && value && onChangeText ? (
        <Pressable onPress={() => onChangeText('')} hitSlop={8}>
          <Feather name='x' size={18} color={theme.subtext} />
        </Pressable>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [{ opacity: pressed ? 0.94 : 1 }]}>
        {inner}
      </Pressable>
    );
  }

  return inner;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 8,
    height: Layout.inputHeight,
    borderRadius: Layout.inputRadius,
    borderCurve: 'continuous',
    gap: 10,
  },
  headerContainer: {
    paddingLeft: 16,
    paddingRight: 16,
    height: 52,
  },
  searchIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 0,
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
