type OverlayMode =
  | 'loading'
  | 'noPlaysLeft'
  | 'mustComplete'
  | 'gameOver'
  | 'welcome'
  | 'none';

export function getOverlayMode(params: {
  loading: boolean;
  canPlay: boolean;
  playCount: number | null;
  gameStarted: boolean;
  gameOver: boolean;
  waitingForPlayCountUpdate?: boolean;
  isReady?: boolean;
}) : OverlayMode {
  const { loading, canPlay, playCount, gameStarted, gameOver, waitingForPlayCountUpdate, isReady } = params;
  
  if (!isReady) return 'loading';

  if (loading) return 'loading';

  if (waitingForPlayCountUpdate) return 'loading';

  if (waitingForPlayCountUpdate) return 'loading';

  const playsLeft = 3 - (playCount ?? 0);

  if (playsLeft <= 0) return 'noPlaysLeft';

  if (!canPlay) return 'mustComplete';

  if (gameOver && playsLeft > 0) return 'gameOver';

  if (!gameStarted) return 'welcome';

  return 'none';
}
