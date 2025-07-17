import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  Animated,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { FishColor } from "@/constants/fishMap";
import { sendNudge } from "@/lib/nudgeService";
import { useImagesReady } from "@/hooks/useImagesReady";
import Colors from "@/constants/Colors";
import fishImages from "@/constants/fishMap";
import bubbles from "@/assets/images/bubbles.png";
import starfish from "@/assets/images/starfish.png";
import preyImg from "@/assets/images/prey.png";
import FriendModal from "@/components/Modals/FriendModal";

export type Props = {
  fish_name?: string | null;
  friend_code: string;
  fish_color?: string | FishColor | null;
  high_score?: number | null;
  showFullDetails?: boolean;
  smallText?: boolean;
  friendId?: string;
  onRemoved?: (id: string) => void;
};

export default function Friend({
  fish_name,
  friend_code,
  fish_color,
  high_score,
  showFullDetails,
  smallText,
  friendId,
  onRemoved,
}: Props) {
  const colorScheme = useColorScheme();
  const textColor = colorScheme === "dark" ? "#eee" : "#222";
  const greyText = colorScheme === "dark" ? "#aaa" : "#888";
  const cardColor =
    colorScheme === "dark" ? Colors.dark.card : Colors.light.card;
  const bubbleBg =
    colorScheme === "dark" ? "rgba(207,233,241,0.7)" : "rgba(123,182,212,0.4)";
  const starBg =
    colorScheme === "dark" ? "rgba(198,250,178,0.6)" : "rgba(75,144,50,0.3)";

  const fallbackColor = (
    fish_color && fish_color in fishImages ? fish_color : "blue"
  ) as FishColor;
  const fishImage = fishImages[fallbackColor];

  const totalImgs = showFullDetails && high_score != null ? 2 : 1;
  const { done, onImgLoad } = useImagesReady(totalImgs);

  const [modalVisible, setModalVisible] = useState(false);

  const opacityRow = useRef(new Animated.Value(0)).current;
  const opacitySkel = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (done) {
      Animated.parallel([
        Animated.timing(opacityRow, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacitySkel, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [done]);

  return (
    <View style={{ position: "relative" }}>
      {/* Skeleton overlay */}
      <Animated.View
        style={[
          styles.wrapper,
          styles.skeleton,
          { backgroundColor: "rgba(204,204,204,0.2)", opacity: opacitySkel },
        ]}
      />

      {/* Actual content */}
      <Pressable
        onPress={showFullDetails ? () => setModalVisible(true) : undefined}
      >
        <Animated.View
          style={[
            styles.wrapper,
            { backgroundColor: cardColor, opacity: opacityRow },
          ]}
        >
          <View style={styles.friendWrapper}>
            <View style={styles.friendInfo}>
              <Image
                source={fishImage}
                style={styles.image}
                onLoadEnd={onImgLoad}
              />
              <Text
                style={[
                  styles.text,
                  smallText ? styles.smallText : styles.largeText,
                  { color: textColor },
                ]}
              >
                {fish_name || friend_code}
              </Text>
            </View>

            {showFullDetails && high_score != null && (
              <View style={[styles.highScore, { backgroundColor: cardColor }]}>
                <Image
                  source={preyImg}
                  style={styles.fishImage}
                  onLoadEnd={onImgLoad}
                />
                <Text
                  style={[
                    styles.text,
                    smallText ? styles.smallText : styles.largeText,
                    { color: greyText, marginLeft: 2 },
                  ]}
                >
                  {high_score}
                </Text>
              </View>
            )}
          </View>

          {showFullDetails && (
            <View style={[styles.actions, { backgroundColor: cardColor }]}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: starBg, opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => friendId && sendNudge(friendId, "hug")}
              >
                <Image
                  source={starfish}
                  style={[styles.actionImage, { width: 22 }]}
                />
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: bubbleBg, opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => friendId && sendNudge(friendId, "breathe")}
              >
                <Image
                  source={bubbles}
                  style={[styles.actionImage, { width: 20 }]}
                />
              </Pressable>
            </View>
          )}
        </Animated.View>
      </Pressable>

      {friendId && (
        <FriendModal
          visible={modalVisible}
          friendId={friendId}
          onClose={() => setModalVisible(false)}
          fishName={fish_name || friend_code}
          onRemoved={onRemoved}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    gap: 12,
    width: "100%",
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  skeleton: {
    ...StyleSheet.absoluteFillObject,
    marginVertical: 18,
  },
  friendWrapper: {
    backgroundColor: "transparent",
    flexDirection: "row",
  },
  friendInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
    backgroundColor: "transparent",
  },
  image: {
    width: 20,
    height: 20,
    marginRight: 4,
  },
  text: {
    fontWeight: "500",
  },
  largeText: {
    fontSize: 18,
  },
  smallText: {
    fontSize: 15,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  actionImage: {
    height: 22,
    backgroundColor: "transparent",
  },
  fishImage: {
    width: 14,
    height: 14,
  },
  highScore: {
    flexDirection: "row",
    alignItems: "center",
  },
});
