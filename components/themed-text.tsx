import { StyleSheet, Text, type TextProps } from 'react-native';

import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | 'default'
    | 'title'
    | 'largeTitle'
    | 'headline'
    | 'defaultSemiBold'
    | 'subtitle'
    | 'callout'
    | 'caption'
    | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'largeTitle' ? styles.largeTitle : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'headline' ? styles.headline : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'callout' ? styles.callout : undefined,
        type === 'caption' ? styles.caption : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: Typography.body,
  largeTitle: Typography.largeTitle,
  title: Typography.title,
  headline: Typography.headline,
  defaultSemiBold: {
    ...Typography.body,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  callout: Typography.callout,
  caption: Typography.caption,
  link: {
    ...Typography.body,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
