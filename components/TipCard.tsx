import React from 'react';
import { View, Text, Button } from '@/components/Themed';
import { useTipPurchase } from '@/hooks/useTipPurchase';
import { StyleSheet } from 'react-native';
import { Loader } from '@/components/Loader';

export default function TipCard() {
  const { loading, processing, error, buyTip, price } = useTipPurchase();

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        This app was made by one person, slowly and with love. No subscriptions, just a tiny project from me to you. Tips help me keep it alive!
      </Text>

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
});