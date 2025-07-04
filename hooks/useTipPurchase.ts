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

export function useTipPurchase() {
  const { user, profile, refreshProfileQuiet } = useSession();

  const [hasTipped, setHasTipped] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

      Alert.alert('Success', 'Thank you for your support!');
      DeviceEventEmitter.emit('tipped');
      setHasTipped(true);
      setProcessing(false);
      return true;
    },

    onPurchaseError: (err) => {
      if (err.code !== ErrorCode.E_USER_CANCELLED) setError(err.message);
      setProcessing(false);
    },
  });

  useEffect(() => {
    if (!user?.id) {
      AsyncStorage.getItem(HAS_TIPPED_KEY).then(tipped => {
        if (tipped === 'true') setHasTipped(true);
      });
    } else {
      setHasTipped(!!profile?.has_tipped);
    }
  }, [user?.id, profile?.has_tipped]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (connected) {
        try {
          await getProducts(PRODUCT_IDS);
        } catch (err: any) {
          console.warn('[IAP] product fetch failed:', err);
          setError(err.message ?? 'Product fetch failed');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [connected]);

  const buyTip = useCallback(async (): Promise<string | undefined> => {
    const sku = products?.[0]?.id;
    if (!connected) return 'Store not connected';
    if (!sku) return 'Tip unavailable';
    if (processing) return 'Already processing';

    setProcessing(true);
    setError(null);

    try {
      await requestPurchase({ request: { sku } });
    } catch (err: any) {
      setProcessing(false);
      return err?.message ?? 'Purchase failed';
    }

    return undefined;
  }, [connected, products, processing]);

  const price = products?.[0]?.displayPrice ?? '$2.99';

  return {
    loading,
    processing,
    error,
    buyTip,
    price,
    hasTipped,
  };
}