import { useEffect, useState, useCallback } from 'react';
import { getPlayCount, incrementPlayCount, resetPlayCount } from '@/lib/playCount';

export function usePlayCount() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const c = await getPlayCount();
      if (!cancel) { setCount(c); setLoading(false); }
    })();
    return () => { cancel = true; };
  }, []);

  const inc = useCallback(async () => {
    const newCount = await incrementPlayCount();
    setCount(newCount);
  }, []);

  const reset = useCallback(async () => {
    await resetPlayCount();
    setCount(0);
  }, []);

  return { playCount: count, increment: inc, reset, loading };
}