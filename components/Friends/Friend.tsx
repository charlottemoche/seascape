import React from 'react';
import { Image, StyleSheet, useColorScheme, Pressable } from 'react-native';
import { FishColor } from '@/constants/fishMap';
import { View, Text } from '@/components/Themed';
import { supabase } from '@/lib/supabase';
import { sendNudge } from '@/lib/nudgeService';
import fishImages from '@/constants/fishMap';
import Colors from '@/constants/Colors';
import bubbles from '@/assets/images/bubbles.png';
import starfish from '@/assets/images/starfish.png';
import preyImg from '@/assets/images/prey.png';

type Props = {
  fish_name?: string | null;
  friend_code: string;
  fish_color?: string | FishColor | null;
  high_score?: number | null;
  showFullDetails?: boolean;
  smallText?: boolean;
  receiverId?: string;
};

export default function Friend({ fish_name, friend_code, fish_color, high_score, showFullDetails, smallText, receiverId }: Props) {
  const colorScheme = useColorScheme();
  const textColor = colorScheme === 'dark' ? '#eee' : '#222';
  const greyTextColor = colorScheme === 'dark' ? '#aaa' : '#888';
  const cardColor = colorScheme === 'dark' ? Colors.dark.card : Colors.light.card;
  const bubbleBackground = colorScheme === 'dark' ? 'rgba(207, 233, 241, 0.7);' : 'rgba(123, 182, 212, 0.4)';
  const starFishBackground = colorScheme === 'dark' ? 'rgba(198, 250, 178, 0.6)' : 'rgba(75, 144, 50, 0.3)';

  const fallbackColor = (fish_color && fish_color in fishImages ? fish_color : 'blue') as FishColor;
  const fishImage = fishImages[fallbackColor];

  return (
    <View>
      <View style={[styles.wrapper, { backgroundColor: cardColor }]}>
        <View style={styles.friendWrapper}>
          <View style={[styles.friendInfo, { backgroundColor: cardColor }]}>
            <Image source={fishImage} style={[styles.image]} />
            <Text style={[styles.text, smallText ? styles.smallText : styles.largeText, { color: textColor }]}>
              {fish_name || friend_code}
            </Text>
          </View>
          {showFullDetails && high_score && high_score !== null && (
            <View style={[styles.highScore, { backgroundColor: cardColor }]}>
              <Image source={preyImg} style={styles.fishImage} />
              <Text style={[styles.text, smallText ? styles.smallText : styles.largeText, { color: greyTextColor, marginLeft: 4 }]}>
                {high_score}
              </Text>
            </View>
          )}
        </View>

        {showFullDetails &&
          <View style={[styles.actions, { backgroundColor: cardColor }]}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: starFishBackground, opacity: pressed ? 0.7 : 1 }
              ]}
              onPress={() => {
                if (receiverId) sendNudge(receiverId, 'hug');
              }}
            >
              <Image source={starfish} style={[styles.actionImage, { width: 22 }]} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: bubbleBackground, opacity: pressed ? 0.7 : 1 }
              ]}
              onPress={() => {
                if (receiverId) sendNudge(receiverId, 'breathe');
              }}
            >
              <Image
                source={bubbles}
                style={[styles.actionImage, { width: 20 }]}
              />
            </Pressable>
          </View>
        }
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    gap: 12,
    width: '100%',
  },
  friendWrapper: {
    paddingVertical: 18,
    backgroundColor: 'transparent',
    flexDirection: 'row',
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
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
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignContent: 'center',
    alignSelf: 'center',
  },
  actionImage: {
    height: 22,
    backgroundColor: 'transparent',
  },
  fishImage: {
    width: 14,
    height: 14,
  },
  highScore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});