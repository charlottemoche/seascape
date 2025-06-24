/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import { Text as DefaultText, View as DefaultView, Pressable, StyleSheet, TextInput, TextInputProps, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type InputProps = ThemeProps & DefaultView['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export type ButtonProps = {
  title: string;
  onPress: () => void;
  style?: any;
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
  variant?: 'primary' | 'secondary' | 'danger';
};

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
  const backgroundColor = useThemeColor({}, 'background');

  return <DefaultView style={[{ backgroundColor }, style, styles.view]} {...otherProps} />;
}

export function Button({
  title,
  onPress,
  style,
  disabled,
  loading,
  textColor,
  variant = 'primary',
}: ButtonProps & { textColor?: string }) {
  const primaryBg = useThemeColor({}, 'button');
  const primaryText = useThemeColor({}, 'buttonText');

  const secondaryBg = useThemeColor({}, 'buttonSecondary');
  const secondaryText = useThemeColor({}, 'buttonText');

  const dangerBg = useThemeColor({}, 'danger');
  const dangerText = useThemeColor({}, 'white');

  const backgroundColor = variant === 'primary' ? primaryBg : variant === 'secondary' ? secondaryBg : dangerBg;
  const resolvedTextColor = variant === 'primary' ? primaryText : variant === 'secondary' ? textColor ?? secondaryText : dangerText;

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
        {
          borderWidth: 2,
          borderColor: variant === 'danger' ? '#dd0b0b' : Colors.custom.blue
        },
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
  const backgroundColor = useThemeColor({}, 'input');

  return <TextInput style={[styles.input, { borderColor, color, backgroundColor }, style]} {...otherProps} />;
}

const styles = StyleSheet.create({
  button: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center',
    maxWidth: 500,
    width: 180,
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
    minWidth: '90%',
    maxWidth: '90%',
    height: 40,
  },
  card: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 14,
    borderWidth: 1,
  },
  view: {
    flex: 1,
  },
});