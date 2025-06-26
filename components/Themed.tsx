/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import { Text as DefaultText, View as DefaultView, Pressable, StyleSheet, TextInput, TextInputProps } from 'react-native';
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
  margin?: boolean;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
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
  margin = true,
  variant = 'primary',
}: ButtonProps & { textColor?: string }) {

  const c = {
    primaryBg:   useThemeColor({}, 'button'),
    primaryText: useThemeColor({}, 'buttonText'),

    secondaryBg: useThemeColor({}, 'buttonSecondary'),
    secondaryText: useThemeColor({}, 'buttonText'),

    dangerBg:    useThemeColor({}, 'danger'),
    dangerText:  useThemeColor({}, 'white'),

    tertiaryBg:  useThemeColor({}, 'transparent'), 
    tertiaryText: useThemeColor({}, 'text'),
  };

  const variants = {
    primary: {
      bg:   c.primaryBg,
      text: c.primaryText,
      border: Colors.custom.blue,
    },
    secondary: {
      bg:   c.secondaryBg,
      text: textColor ?? c.secondaryText,
      border: Colors.custom.blue,
    },
    danger: {
      bg:   c.dangerBg,
      text: c.dangerText,
      border: '#dd0b0b',
    },
    tertiary: {
      bg:   c.tertiaryBg,
      text: textColor ?? c.tertiaryText,
      border: '#6a6a6a',
    },
  } as const;

  const { bg, text, border } = variants[variant];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bg,
          opacity: pressed ? 0.7 : 1,
          borderWidth: 2,
          borderColor: border,
        },
        disabled && { opacity: 0.4 },
        margin && { marginTop: 10 },
        style,
      ]}
      disabled={disabled || loading}
    >
      <Text style={[styles.text, { color: text }]}>
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
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center',
    maxWidth: 500,
    width: 150,
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