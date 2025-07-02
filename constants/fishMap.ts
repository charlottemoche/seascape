export type FishColor = 'blue' | 'red' | 'green' | 'purple' | 'yellow' | 'rainbow' | 'colored';

const fishImages: Record<FishColor, any> = {
  blue: require('@/assets/images/fish.png'),
  red: require('@/assets/images/fish-red.png'),
  green: require('@/assets/images/fish-green.png'),
  purple: require('@/assets/images/fish-purple.png'),
  yellow: require('@/assets/images/fish-yellow.png'),
  rainbow: require('@/assets/images/rainbow-fish.png'),
  colored: require('@/assets/images/colored-fish.png'),
};

export default fishImages;