import React from 'react';
import {
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  useColorScheme,
} from 'react-native';
import { useNudge } from '@/context/NudgeContext';
import { sendNudge } from '@/lib/nudgeService';
import { View, Text, Button } from '@/components/Themed';
import Colors from '@/constants/Colors';
import starfish from '@/assets/images/starfish.png';
import bubbles from '@/assets/images/bubbles.png';
import whiteStarfish from '@/assets/images/white-starfish.png';
import whiteBubbles from '@/assets/images/white-bubbles.png';

export default function NudgeModal() {
  const { nudge, setNudge } = useNudge();
  const colorScheme = useColorScheme();

  const starfishImage =
    colorScheme === 'dark'
      ? whiteStarfish
      : starfish;

  const bubblesImage =
    colorScheme === 'dark'
      ? whiteBubbles
      : bubbles;

  if (!nudge) return null;

  const bg = colorScheme === 'dark' ? Colors.custom.dark : Colors.light.background;
  const fog = colorScheme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.3)';
  const text = colorScheme === 'dark' ? '#fff' : '#000';
  const icon = nudge.type === 'hug' ? starfishImage : bubblesImage;
  const hug = nudge.type === 'hug'
  const verb = hug ? 'a starfish hug' : 'a reminder to breathe';

  return (
    <Modal transparent animationType="fade" visible>
      <TouchableWithoutFeedback onPress={() => setNudge(null)}>
        <View style={[styles.overlay, { backgroundColor: fog }]} />
      </TouchableWithoutFeedback>

      <View style={[styles.card, { backgroundColor: bg }]}>
        <Image source={icon} style={styles.icon} />
        <Text style={[styles.title, { color: text, marginBottom: hug ? 12 : 0 }]}>
          {`${nudge.sender} sent you ${verb}` + (hug ? '!' : '')}
        </Text>

        {nudge.senderId && hug && (
          <Button
            title="Send one back"
            onPress={async () => {
              await sendNudge(nudge.senderId!, nudge.type);
              setNudge(null);
            }}
          />
        )}

        <View>
          <Button
            title="Close"
            onPress={() => setNudge(null)}
            variant="plain"
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1
  },
  card: {
    position: 'absolute',
    top: '35%',
    left: '10%',
    right: '10%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset:
      { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 6,
  },
  icon: {
    width: 40,
    height: 40,
    marginBottom: 16,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
  },
  replyText: {
    fontWeight: '500'
  },
});
