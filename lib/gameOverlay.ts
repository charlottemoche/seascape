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
}): OverlayMode {
  const { loading, canPlay, playCount, gameStarted, gameOver } = params;

  if (loading || playCount === null) {
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

  if (!gameStarted) {
    return 'welcome';
  }

  return 'none';
}