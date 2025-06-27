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
  smallText?: boolean;
};

export default function Friend({ fish_name, friend_code, fish_color, high_score, labeled, smallText }: Props) {
  const colorScheme = useColorScheme();
  const textColor = colorScheme === 'dark' ? '#eee' : '#222';

  const fallbackColor = (fish_color && fish_color in fishImages ? fish_color : 'blue') as FishColor;
  const fishImage = fishImages[fallbackColor];

  return (
    <View style={styles.wrapper}>

      <View style={styles.friendInfo}>
        <Image source={fishImage} style={[styles.image]} />
        <Text style={[styles.text, smallText ? styles.smallText : styles.largeText, { color: textColor }]}>
          {fish_name || friend_code}
        </Text>
      </View>

      {labeled && high_score && high_score !== null && (
        <Text style={[styles.text, smallText ? styles.smallText : styles.largeText, { color: textColor, marginLeft: 12 }]}>
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
    fontWeight: 500,
  },
  largeText: {
    fontSize: 18,
  },
  smallText: {
    fontSize: 16,
  },
});