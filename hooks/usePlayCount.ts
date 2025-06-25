import { useEffect, useState, useCallback } from 'react';
import { getPlayCount, incrementPlayCount, resetPlayCount } from '@/lib/playCount';

export function usePlayCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    getPlayCount().then(setCount);
  }, []);

  const inc = useCallback(async () => {
    const newCount = await incrementPlayCount();
    setCount(newCount);
  }, []);

  const reset = useCallback(async () => {
    await resetPlayCount();
    setCount(0);
  }, []);

  return { playCount: count, increment: inc, reset, loading: count === null };
}