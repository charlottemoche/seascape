import { useState, useCallback } from 'react';

export function useImagesReady(total: number) {
  const [count, setCount] = useState(0);
  const done = count >= total;
  const onImgLoad = useCallback(() => setCount(c => c + 1), []);
  return { done, onImgLoad };
}