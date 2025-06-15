import React from 'react';
import { View, Image, StyleSheet, useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Logo() {
  const colorScheme = useColorScheme();

  const logoImage =
    colorScheme === 'dark'
      ? require('@/assets/images/logo-light.png')
      : require('@/assets/images/logo-dark.png');

  const backgroundColor = colorScheme === 'dark' ? Colors.custom.dark : Colors.custom.lightBlue;

  return (
    <SafeAreaView edges={['top']} style={[styles.topBar, { backgroundColor }]}>
      <View style={styles.logoContainer}>
        <Image source={logoImage} style={styles.logo} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderBottomColor: Colors.custom.blue,
    borderBottomWidth: 1,
    paddingBottom: 20,
  },
  logoContainer: {
    height: 40,
  },
  logo: {
    height: 60,
    width: 140,
    resizeMode: 'contain',
  },
});