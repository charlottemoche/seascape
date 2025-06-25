import React from 'react';
import { View, Text, Image, StyleSheet, useColorScheme } from 'react-native';
import { FishColor } from '@/constants/fishMap';
import fishImages from '@/constants/fishMap';

type Props = {
  fish_name?: string | null;
  friend_code: string;
  fish_color?: string | FishColor | null;
  high_score?: number | null;
  labeled?: boolean;
};

export default function Friend({ fish_name, friend_code, fish_color, high_score, labeled }: Props) {
  const colorScheme = useColorScheme();
  const textColor = colorScheme === 'dark' ? '#eee' : '#222';

  const fallbackColor = (fish_color && fish_color in fishImages ? fish_color : 'blue') as FishColor;
  const fishImage = fishImages[fallbackColor];

  return (
    <View style={styles.wrapper}>

      <View style={styles.friendInfo}>
        <Image source={fishImage} style={styles.image} />
        <Text style={[styles.text, { color: textColor }]}>
          {fish_name || friend_code}
        </Text>
      </View>

      {high_score != null && (
        <Text style={[styles.text, { color: textColor, marginLeft: 12 }]}>
          {labeled ? 'High score: ' : ''}
          {high_score}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    width: '100%',
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: 500,
  },
});