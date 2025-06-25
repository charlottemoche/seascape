type OverlayMode =
  | 'loading'
  | 'noPlaysLeft'
  | 'mustComplete'
  | 'gameOver'
  | 'welcome'
  | 'start'
  | 'none';

export function getOverlayMode(params: {
  loading: boolean;
  canPlay: boolean;
  playCount: number;
  gameStarted: boolean;
  gameOver: boolean;
  hasPlayed?: boolean;
}): OverlayMode {
  const { loading, canPlay, playCount, gameStarted, gameOver, hasPlayed } = params;

  if (loading) {
    return 'loading';
  }

  const playsLeft = 3 - playCount;

  if (playsLeft <= 0) {
    return 'noPlaysLeft';
  }

  if (!canPlay) {
    return 'mustComplete';
  }

  if (gameOver && playsLeft > 0) {
    return 'gameOver';
  }

  if (!gameStarted && !hasPlayed) {
    return 'welcome';
  }

  if (!gameStarted && hasPlayed) {
    return 'start';
  }

  return 'none';
}