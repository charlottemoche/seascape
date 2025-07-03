import React, { useState } from 'react';
import { StyleSheet, Image } from 'react-native';
import { View, Text, Button } from '@/components/Themed';
import { useTipPurchase } from '@/hooks/useTipPurchase';
import { Loader } from '@/components/Loader';
import rainbowFish from '@/assets/images/rainbow-fish.png';
import coloredFish from '@/assets/images/colored-fish.png';

const COLORED_FISH = coloredFish;
const RAINBOW_FISH = rainbowFish;

export default function TipCard() {
  const {
    loading, processing, error, buyTip, price, iapReady,
  } = useTipPurchase();

  const [inlineError, setInlineError] = useState<string | null>(null);

  const handlePress = async () => {
    const reason = await buyTip();
    if (reason) setInlineError(reason);
    else setInlineError(null);
  };

  const label = loading
    ? 'Loading…'
    : `Buy me a coffee (${price})`;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        This app was made by one person, slowly and with care. No subscriptions, no ads, just a tiny project from me to you. Tips help me keep it alive!
      </Text>
      <Text style={styles.text}>
        If you are logged in, your tip will unlock two new fish colors.
      </Text>

      <View style={styles.imageContainer}>
        <Image source={COLORED_FISH} style={styles.image} />
        <Image source={RAINBOW_FISH} style={styles.image} />
      </View>

      {processing && <Loader />}

      <Button
        title={label}
        onPress={handlePress}
        disabled={processing}
        variant="secondary"
      />

      {inlineError && <Text style={styles.error}>{inlineError}</Text>}
      {error && !inlineError && <Text style={styles.error}>{error}</Text>}
      {iapReady === 'empty' && !inlineError && (
        <Text style={styles.error}>Tip unavailable (Apple review)</Text>
      )}
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
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  image: {
    width: 40,
    height: 40,
  },
  error: {
    color: 'red',
    marginTop: 24,
    textAlign: 'center',
  },
});