import { Colors } from '@/constants/theme';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useMemo } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';

interface AppBottomSheetProps {
  children: React.ReactNode;
  snapPoints?: string[];
  index?: number;
}

export const AppBottomSheet = forwardRef<BottomSheetModal, AppBottomSheetProps>(
  ({ children, snapPoints, index = 0 }, ref) => {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const defaultSnapPoints = useMemo(() => ['50%', '75%', '90%'], []);
    const finalSnapPoints = snapPoints || defaultSnapPoints;

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.5}
        />
      ),
      []
    );

    return (
      <BottomSheetModal
        ref={ref}
        index={index}
        snapPoints={finalSnapPoints}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={[
          styles.indicator,
          { backgroundColor: colorScheme === 'light' ? '#E0E0E0' : '#444' },
        ]}
        backgroundStyle={[styles.background, { backgroundColor: theme.card }]}>
        <BottomSheetView style={styles.content}>
          <View collapsable={false} style={{ flex: 1 }}>
            {children}
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

AppBottomSheet.displayName = 'AppBottomSheet';

const styles = StyleSheet.create({
  background: {
    borderRadius: 24,
  },
  indicator: {
    width: 40,
  },
  content: {
    flex: 1,
  },
});
