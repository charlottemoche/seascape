import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function Logo() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.topBar, { paddingTop: insets.top }]}>
      <View style={styles.logoContainer}>
        <Image source={require('@/assets/images/logo-light.png')} style={styles.logo} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: Colors.custom.background,
    zIndex: 10,
  },
  logoContainer: {
    height: 40,
  },
  logo: {
    height: 60,
    width: 140,
    resizeMode: 'contain',
  }
});
