import { useEffect, useState, useCallback } from 'react';
import * as InAppPurchases from 'expo-in-app-purchases';

const PRODUCT_IDS = ['tip_small_coffee'];

export function useTipPurchase() {

  const [loading, setLoading] = useState(true);
  const [processing, setProc] = useState(false);
  const [products, setProducts] = useState<InAppPurchases.IAPItemDetails[]>([]);
  const [error, setError] = useState<null | string>(null);

  // ➊- Initialise IAP & fetch products once
  useEffect(() => {
    async function init() {
      try {
        console.log('[IAP] connecting...');
        await InAppPurchases.connectAsync();
        console.log('[IAP] connected');
        const { results } = await InAppPurchases.getProductsAsync(PRODUCT_IDS);
        console.log('[IAP] results:', results); 
        setProducts(results || []);
        InAppPurchases.setPurchaseListener(({ responseCode, results }) => {
          if (responseCode === InAppPurchases.IAPResponseCode.OK) {
            /* 🔔 TODO: (optional) ping your API so you know a tip happened */
            // set has_tipped = true on the profile
          }
          // always finish so the purchase is “consumed”
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
    console.log('[IAP] purchase called', products[0].productId);
  }, [products]);

  return { loading, processing, error, buyTip, price: products[0]?.price ?? '$2.99' };
}