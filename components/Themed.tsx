/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import { Text as DefaultText, View as DefaultView, Pressable, StyleSheet, TextInput, TextInputProps } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Icon } from './Icon';
import Colors from '@/constants/Colors';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type InputProps = ThemeProps & DefaultView['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export type ButtonProps = {
  title?: string;
  onPress: () => void;
  style?: any;
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
  margin?: boolean;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'plain' | 'danger';
  width?: number;
  icon?: React.ReactNode;
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

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
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
  width = 150,
  icon = null,
}: ButtonProps & { textColor?: string }) {

  const c = {
    primaryBg: useThemeColor({}, 'button'),
    primaryText: useThemeColor({}, 'buttonText'),

    secondaryBg: useThemeColor({}, 'buttonSecondary'),
    secondaryText: useThemeColor({ light: '#000', dark: '#fff' }, 'buttonText'),

    dangerBg: useThemeColor({}, 'danger'),
    dangerText: useThemeColor({ light: '#000', dark: '#fff' }, 'white'),

    tertiaryBg: useThemeColor({ light: '#fff', dark: '#545454' }, 'transparent'),
    tertiaryBorder: useThemeColor({ light: '#ddd', dark: '#2a2a2a' }, 'transparent'),
    tertiaryText: useThemeColor({ light: '#000', dark: '#000' }, 'text'),
  };

  const variants = {
    primary: {
      bg: c.primaryBg,
      text: c.primaryText,
      border: 'rgba(123,182,212,0.1)',
    },
    secondary: {
      bg: 'rgba(123,182,212,0.1)',
      text: textColor ?? c.secondaryText,
      border: 'rgba(123,182,212,0.4)',
    },
    danger: {
      bg: c.dangerBg,
      text: c.dangerText,
      border: 'rgba(221, 11, 11, 0.2)',
    },
    tertiary: {
      bg: c.tertiaryBg,
      text: textColor ?? c.tertiaryText,
      border: c.tertiaryBorder,
    },
    plain: {
      bg: 'transparent',
      text: textColor ?? c.secondaryText,
      border: 'transparent',
    },
  } as const;

  const { bg, text, border } = variants[variant];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        width && { width, maxWidth: width },
        {
          backgroundColor: bg,
          opacity: pressed ? 0.7 : 1,
          borderWidth: 1,
          borderColor: border,
        },
        disabled && { opacity: 0.7 },
        margin && { marginTop: 10 },
        style,
      ]}
      disabled={disabled || loading}
    >
      {icon && title && (
        <View style={styles.iconLeft}>
          {icon}
        </View>
      )}

      {title && (
        <View style={styles.labelWrap}>
          <Text style={[styles.text, { color: text }]}>
            {loading ? 'Loading…' : title}
          </Text>
        </View>
      )}

      {icon && !title && icon}
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
    paddingVertical: 8,
    paddingHorizontal: 7,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    maxWidth: 500,
  },
  iconLeft: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  labelWrap: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  text: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
  },
  icon: {
    backgroundColor: 'transparent',
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
});