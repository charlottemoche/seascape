import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/context/SessionContext';
import * as InAppPurchases from 'expo-in-app-purchases';

const PRODUCT_IDS = ['tip_small_coffee'];

export function useTipPurchase() {
  const { user, refreshProfileQuiet } = useSession();

  const [loading, setLoading] = useState(true);
  const [processing, setProc] = useState(false);
  const [products, setProducts] = useState<InAppPurchases.IAPItemDetails[]>([]);
  const [error, setError] = useState<null | string>(null);

  const isLoggedIn = !!user;

  useEffect(() => {
    async function init() {
      try {
        await InAppPurchases.connectAsync();
        const { results } = await InAppPurchases.getProductsAsync(PRODUCT_IDS);
        setProducts(results || []);
        InAppPurchases.setPurchaseListener(({ responseCode, results }) => {
          if (responseCode === InAppPurchases.IAPResponseCode.OK) {
            if (isLoggedIn) {
              supabase
                .from('profiles')
                .update({ has_tipped: true })
                .eq('user_id', user.id)
                .then(() => {
                  refreshProfileQuiet();
                });
            }
          }
          results?.forEach(r => InAppPurchases.finishTransactionAsync(r, false));
          setProc(false);
        });
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    init();
    return () => {
      InAppPurchases.disconnectAsync();
    };
  }, []);

  const buyTip = useCallback(async () => {
    if (!products[0]) return;
    setProc(true);
    await InAppPurchases.purchaseItemAsync(products[0].productId);
  }, [products]);

  return { loading, processing, error, buyTip, price: products[0]?.price ?? '$2.99' };
}