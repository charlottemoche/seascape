import { StyleSheet, Image, useColorScheme } from 'react-native';
import { View, Text, Button } from '@/components/Themed';
import { useTipPurchase } from '@/hooks/useTipPurchase';
import rainbowFish from '@/assets/images/rainbow-fish.png';
import coloredFish from '@/assets/images/colored-fish.png';
import Colors from '@/constants/Colors';

export default function TipCard() {
  const { loading, processing, buyTip, price, hasTipped } = useTipPurchase();

  const colorScheme = useColorScheme();

  const messageText = colorScheme === 'dark' ? Colors.custom.blue : Colors.custom.green;

  const handlePress = async () => {
    buyTip();
  };

  const label = loading ? 'Loading...' : `Buy me a coffee (${price})`;
  const message = hasTipped
    ? 'Thank you for the coffee! Enjoy your new fish colors.'
    : 'Your tip unlocks two new fish colors.';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Support the app</Text>
      {!hasTipped && (
        <Text style={styles.text}>
          This app was made by one person, slowly and with care. No subscriptions,
          no ads, just a tiny project from me to you. Tips help me keep it alive!
        </Text>
      )}

      {hasTipped ? (
        <Text style={[styles.text, { color: messageText }]}>
          {message}
        </Text>
      ) : (
        <Text style={styles.text}>{message}</Text>
      )}

      <View style={styles.imageContainer}>
        <Image source={coloredFish} style={styles.image} />
        <Image source={rainbowFish} style={styles.image} />
      </View>

      <Button
        title={label}
        onPress={handlePress}
        disabled={loading || processing}
        loading={processing}
        variant="secondary"
      />

      <Text style={[styles.text, { marginTop: 20 }]}>
        Please note that if you are not logged in, your tip status and new
        fish colors will only be accessible on this device.
      </Text>
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
  title: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 500,
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