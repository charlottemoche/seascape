import { useEffect, useState, useCallback } from 'react';
import {
  useIAP,
  ErrorCode,
  Purchase,
  finishTransaction,
} from 'expo-iap';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/context/SessionContext';
import { Alert, DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PRODUCT_IDS = ['tip_001'];
const HAS_TIPPED_KEY = 'has_tipped';
const FRIENDLY_FAIL =
  'There was an error completing your purchase. Please try again.';

export function useTipPurchase() {
  const { user, profile, refreshProfileQuiet } = useSession();

  const [hasTipped, setHasTipped]   = useState(false);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading]       = useState(true);

  const {
    connected,
    products,
    getProducts,
    requestPurchase,
  } = useIAP({
    onPurchaseSuccess: async (purchase: Purchase) => {
      await finishTransaction({ purchase, isConsumable: true });

      if (user?.id) {
        await supabase
          .from('profiles')
          .update({ has_tipped: true })
          .eq('user_id', user.id);
        refreshProfileQuiet();
      } else {
        await AsyncStorage.setItem(HAS_TIPPED_KEY, 'true');
      }

      setHasTipped(true);
      setProcessing(false);
      DeviceEventEmitter.emit('tipped');
      Alert.alert('Success', 'Your tip was received!');
      return true;
    },

    onPurchaseError: err => {
      if (
        err.code === ErrorCode.E_USER_CANCELLED ||
        err.code === ErrorCode.E_ALREADY_OWNED
      ) {
        setProcessing(false);
        return;
      }

      console.error('[IAP] purchase failed:', err);
      setProcessing(false);
      Alert.alert('Purchase Error', FRIENDLY_FAIL);
    },
  });

  useEffect(() => {
    if (!connected) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        await getProducts(PRODUCT_IDS);
      } catch (err) {
        console.warn('[IAP] product fetch failed:', err);
        Alert.alert('Store Error', FRIENDLY_FAIL);
      } finally {
        setLoading(false);
      }
    })();
  }, [connected]);

  useEffect(() => {
    if (user?.id) {
      setHasTipped(!!profile?.has_tipped);
    } else {
      AsyncStorage.getItem(HAS_TIPPED_KEY).then(t =>
        setHasTipped(t === 'true')
      );
    }
  }, [user?.id, profile?.has_tipped]);

  const buyTip = useCallback(async () => {
    if (!connected) {
      Alert.alert('Store Error', FRIENDLY_FAIL);
      return;
    }
    if (processing) return;

    setProcessing(true);
    try {
      const sku = products?.[0]?.id;
      if (!sku) throw new Error('Tip unavailable');
      await requestPurchase({ request: { sku } });
    } catch (err: any) {
      if (err?.code !== ErrorCode.E_USER_CANCELLED) {
        console.error('[IAP] requestPurchase failed:', err);
        Alert.alert('Purchase Error', FRIENDLY_FAIL);
      }
      setProcessing(false);
    }
  }, [connected, products, processing]);

  const price = products?.[0]?.displayPrice ?? '$2.99';

  return {
    loading,
    processing,
    buyTip,
    price,
    hasTipped,
  };
}
