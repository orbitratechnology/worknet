import { formFieldStyles } from '@/components/ui/form-section';
import { FieldInfoButton } from '@/components/ui/field-info-button';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed-text';

type FormFieldLabelProps = {
  label: string;
  hint?: string;
};

export function FormFieldLabel({ label, hint }: FormFieldLabelProps) {
  return (
    <View style={styles.row}>
      <ThemedText style={formFieldStyles.label}>{label}</ThemedText>
      {hint ? <FieldInfoButton message={hint} title={label} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    width: '100%',
  },
});
