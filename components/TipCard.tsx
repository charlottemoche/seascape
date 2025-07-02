import React from 'react';
import { View, Text, Button } from '@/components/Themed';
import { useTipPurchase } from '@/hooks/useTipPurchase';
import { StyleSheet } from 'react-native';
import { Loader } from '@/components/Loader';
import { Image } from 'react-native';
import rainbowFish from '@/assets/images/rainbow-fish.png';
import coloredFish from '@/assets/images/colored-fish.png';

const COLORED_FISH = coloredFish;
const RAINBOW_FISH = rainbowFish;

export default function TipCard() {
  const { loading, processing, error, buyTip, price } = useTipPurchase();

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        This app was made by one person, slowly and with love. No subscriptions, just a tiny project from me to you. Tips help me keep it alive!
      </Text>
      <Text style={styles.text}>
        Your gift will unlock two new fish colors.
      </Text>
      <View style={styles.imageContainer}>
        <Image source={COLORED_FISH} style={styles.image} />
        <Image source={RAINBOW_FISH} style={styles.image} />
      </View>

      <Button
        title={`Buy me a coffee (${price})`}
        onPress={buyTip}
        disabled={processing}
        variant="secondary"
      />

      {error && <Text style={styles.errorContainer}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  errorContainer: {
    color: 'red',
    marginTop: 24,
    textAlign: 'center',
  },
  text: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 12,
    backgroundColor: 'transparent',
  },
  image: {
    width: 40,
    height: 40,
    marginBottom: 6,
  },
});