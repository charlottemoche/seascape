import { useEffect, useMemo, useState, useCallback } from 'react';
import { useIAP, ErrorCode } from 'expo-iap';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/context/SessionContext';

const PRODUCT_IDS = ['tip_001'];

export function useTipPurchase() {
  const { user, refreshProfileQuiet } = useSession();
  const [inlineError, setInlineError] = useState<string | null>(null);

  const {
    connected,
    products,
    getProducts,
    requestPurchase,
  } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      if (user?.id) {
        await supabase
          .from('profiles')
          .update({ has_tipped: true })
          .eq('user_id', user.id);
        refreshProfileQuiet();
      }
      return true;
    },
    onPurchaseError: (err) => {
      if (err.code === ErrorCode.E_USER_CANCELLED) return;
      setInlineError(err.message ?? 'Purchase failed');
    },
  });

  useEffect(() => {
    if (connected) getProducts(PRODUCT_IDS);
  }, [connected]);

  const price   = products[0]?.displayPrice ?? '$2.99';
  const loading = !connected || (connected && products.length === 0 && !inlineError);
  const iapReady: 'ok' | 'empty' | 'error' =
    inlineError ? 'error' : products.length ? 'ok' : 'empty';

  const buyTip = useCallback(async (): Promise<string | undefined> => {
    if (iapReady !== 'ok') return 'Tip unavailable';
    try {
      await requestPurchase({ request: { sku: products[0].id } });
    } catch (err: any) {
      return err.message ?? 'Purchase failed';
    }
    return undefined;
  }, [iapReady, products]);

  return { loading, error: inlineError, buyTip, price, iapReady };
}