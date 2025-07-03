import { useEffect, useState, useCallback, useMemo } from 'react';
import * as InAppPurchases from 'expo-in-app-purchases';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/context/SessionContext';

const PRODUCT_IDS = ['tip_small_coffee'];
type IapReadyState = false | 'ok' | 'empty' | 'error';

export function useTipPurchase() {
  const { user, refreshProfileQuiet } = useSession();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [products, setProducts] = useState<InAppPurchases.IAPItemDetails[]>([]);
  const [error, setError] = useState<null | string>(null);
  const [iapReady, setIapReady] = useState<IapReadyState>(false);

  const isLoggedIn = !!user;
  const price = useMemo(() => products[0]?.price ?? '$2.99', [products]);

  useEffect(() => {
    InAppPurchases.setPurchaseListener(async ({ responseCode, results }) => {
      if (responseCode === InAppPurchases.IAPResponseCode.OK && isLoggedIn) {
        await supabase
          .from('profiles')
          .update({ has_tipped: true })
          .eq('user_id', user.id);
        refreshProfileQuiet();
      }
      results?.forEach(r => InAppPurchases.finishTransactionAsync(r, false));
      setProcessing(false);
    });

    return () => { void InAppPurchases.disconnectAsync(); };
  }, [isLoggedIn, user?.id, refreshProfileQuiet]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await InAppPurchases.connectAsync();
        const { results } = await InAppPurchases.getProductsAsync(PRODUCT_IDS);
        if (cancelled) return;

        setProducts(results ?? []);
        setIapReady(results?.length ? 'ok' : 'empty');
      } catch (e: any) {
        if (cancelled) return;
        setError(e.message);
        setIapReady('error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const buyTip = useCallback(async (): Promise<string | undefined> => {
    if (iapReady === 'empty') {
      return 'Tipping unavailable until Apple approves the purchase.';
    }
    if (iapReady === 'error') {
      return error ?? 'StoreKit returned an error.';
    }
    if (iapReady !== 'ok' || !products[0]) {
      return 'Tipping not available in this build.';
    }

    setProcessing(true);
    try {
      await InAppPurchases.purchaseItemAsync(products[0].productId);
    } catch (e: any) {
      setProcessing(false);
      return e.message ?? 'Purchase could not start.';
    }
    return undefined;
  }, [iapReady, products, error]);

  return { loading, processing, error, iapReady, buyTip, price };
}