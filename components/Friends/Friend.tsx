import React from 'react';
import { Image, StyleSheet, useColorScheme, Pressable } from 'react-native';
import { FishColor } from '@/constants/fishMap';
import { View, Text } from '@/components/Themed';
import { supabase } from '@/lib/supabase';
import fishImages from '@/constants/fishMap';
import Colors from '@/constants/Colors';
import bubbles from '@/assets/images/bubbles.png';
import starfish from '@/assets/images/starfish.png';

type Props = {
  fish_name?: string | null;
  friend_code: string;
  fish_color?: string | FishColor | null;
  high_score?: number | null;
  showFullDetails?: boolean;
  smallText?: boolean;
  receiverId?: string;
};

type Nudge = 'hug' | 'breathe';

export default function Friend({ fish_name, friend_code, fish_color, high_score, showFullDetails, smallText, receiverId }: Props) {

  async function sendNudge(type: Nudge) {
    if (!receiverId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.rpc('send_notification', {
      _receiver: receiverId,
      _sender: user.id,
      _type: type,
    });

    if (error) console.warn('[notif] rpc failed:', error);
  }
  
  const colorScheme = useColorScheme();
  const textColor = colorScheme === 'dark' ? '#eee' : '#222';
  const cardColor = colorScheme === 'dark' ? Colors.dark.card : Colors.light.card;

  const fallbackColor = (fish_color && fish_color in fishImages ? fish_color : 'blue') as FishColor;
  const fishImage = fishImages[fallbackColor];

  return (
    <View>
      <View style={[styles.wrapper, { backgroundColor: cardColor }]}>
        <View style={[styles.friendInfo, { backgroundColor: cardColor }]}>
          <Image source={fishImage} style={[styles.image]} />
          <Text style={[styles.text, smallText ? styles.smallText : styles.largeText, { color: textColor }]}>
            {fish_name || friend_code}
          </Text>
        </View>

        {showFullDetails && high_score && high_score !== null && (
          <Text style={[styles.text, smallText ? styles.smallText : styles.largeText, { color: textColor, marginLeft: 12 }]}>
            {high_score}
          </Text>
        )}
      </View>

      {showFullDetails &&
        <View style={[styles.actions, { backgroundColor: cardColor }]}>
          <Pressable style={styles.actionButton} onPress={() => sendNudge('hug')}>
            <Image source={starfish} style={[styles.actionImage, { width: 22 }]} />
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => sendNudge('breathe')}>
            <Image
              source={bubbles}
              style={[styles.actionImage, { width: 20 }]}
            />
          </Pressable>
        </View>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
    width: '100%',
  },
  actionButton: {
    padding: 10,
    height: 40,
    alignSelf: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(123, 182, 212, 0.2)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionImage: {
    height: 22,
    backgroundColor: 'transparent',
  },
});