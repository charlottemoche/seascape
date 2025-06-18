/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import { Text as DefaultText, View as DefaultView, Pressable, StyleSheet, TextInput, TextInputProps } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];
export type ButtonProps = {
  title: string;
  onPress: () => void;
  style?: any;
  disabled?: boolean;
  loading?: boolean;
  lightColor?: string;
  darkColor?: string;
  testID?: string;
};
export type InputProps = ThemeProps & DefaultView['props'];

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

export function Button({
  title,
  onPress,
  style,
  disabled,
  loading,
  lightColor,
  darkColor,
  textColor,
}: ButtonProps & { textColor?: string }) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'button');
  const resolvedTextColor =
    textColor ?? useThemeColor({ light: darkColor, dark: darkColor }, 'buttonText');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor,
          opacity: pressed ? 0.7 : 1,
        },
        disabled && { opacity: 0.4 },
        style,
      ]}
      disabled={disabled || loading}
    >
      <Text style={[styles.text, { color: resolvedTextColor }]}>
        {loading ? 'Loading...' : title}
      </Text>
    </Pressable>
  );
}

export function Input(props: TextInputProps) {
  const { style, ...otherProps } = props;
  const borderColor = useThemeColor({}, 'tint');
  const color = useThemeColor({}, 'text');

  return <TextInput style={[styles.input, { borderColor, color }, style]} {...otherProps} />;
}

const styles = StyleSheet.create({
  button: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: 500,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    width: 280,
  },
});