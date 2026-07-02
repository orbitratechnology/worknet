import { formFieldStyles } from '@/components/ui/form-section';
import { Layout } from '@/constants/theme';
import { useFieldStyle } from '@/hooks/use-surface-style';
import { useTheme } from '@/hooks/use-theme';
import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

type SocialBrand = 'instagram' | 'facebook' | 'tiktok';

const BRAND_COLORS: Record<SocialBrand, string> = {
  instagram: '#E4405F',
  facebook: '#1877F2',
  tiktok: '#010101',
};

type SocialLinkFieldProps = {
  brand: SocialBrand;
  value: string;
  onChangeText: TextInputProps['onChangeText'];
  placeholder: string;
  accessibilityLabel: string;
};

export function SocialLinkField({
  brand,
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
}: SocialLinkFieldProps) {
  const theme = useTheme();
  const fieldStyle = useFieldStyle();

  return (
    <View
      style={[
        styles.wrap,
        fieldStyle,
        { backgroundColor: theme.surface },
      ]}>
      <View style={[styles.iconBox, { backgroundColor: theme.muted }]}>
        <FontAwesome5
          name={brand}
          brand
          size={20}
          color={BRAND_COLORS[brand]}
        />
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.subtext}
        accessibilityLabel={accessibilityLabel}
        autoCapitalize='none'
        autoCorrect={false}
        style={[styles.input, { color: theme.text }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    height: Layout.fieldHeight,
    borderRadius: Layout.fieldRadius,
    borderCurve: 'continuous',
    paddingRight: 14,
    gap: 12,
  },
  iconBox: {
    width: 52,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: Layout.fieldRadius - 1,
    borderBottomLeftRadius: Layout.fieldRadius - 1,
  },
  input: {
    flex: 1,
    fontSize: 17,
    fontWeight: '500',
    paddingVertical: 0,
  },
});
