import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Logo() {
  return (
    <SafeAreaView edges={['top']} style={styles.topBar}>
      <View style={styles.logoContainer}>
        <Image source={require('@/assets/images/logo-dark.png')} style={styles.logo} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    backgroundColor: Colors.custom.lightBlue,
    paddingHorizontal: 24,
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
  }
});