import React from "react";
import { View, Text, Image } from "react-native";
import { Button } from "@/components/Themed";
import { Loader } from "@/components/Loader";
import predatorImg from "@/assets/images/predator.png";
import preyImg from "@/assets/images/prey.png";

type OverlayMode =
  | "loading"
  | "noPlaysLeft"
  | "mustComplete"
  | "gameOver"
  | "welcome"
  | "start"
  | "none";

type SwimGameOverlayProps = {
  overlayMode: OverlayMode;
  highScore: number | null;
  isAdmin: boolean;
  playsLeft?: number;
  hasPlayed?: boolean;
  onResetPlayCount: () => void;
  onStartNewGame: () => void;
};

export function SwimGameOverlay({
  overlayMode,
  highScore,
  isAdmin,
  onResetPlayCount,
  onStartNewGame,
  playsLeft,
}: SwimGameOverlayProps) {
  switch (overlayMode) {
    case "loading":
      return (
        <View style={styles.gameMessageOverlay}>
          <Loader />
        </View>
      );

    case "noPlaysLeft":
      return (
        <View style={styles.gameMessageOverlay}>
          <Text style={styles.gameStatusText}>
            You’ve used all 5 plays for today
          </Text>
          <Text style={styles.gameSubtext}>Come back tomorrow!</Text>
          <View style={styles.highScoreRow}>
            <Text style={styles.gameSubtext}>High score: {highScore ?? 0}</Text>
            <Image
              source={preyImg}
              style={styles.preyIcon}
              resizeMode="contain"
            />
          </View>
          {isAdmin && (
            <Button
              onPress={onResetPlayCount}
              title="Reset"
              style={styles.playButtonContainer}
            />
          )}
        </View>
      );

    case "mustComplete":
      return (
        <View style={styles.gameMessageOverlay}>
          <Text style={styles.gameSubtext}>
            You must complete a journal entry or a meditation session today to
            play.
          </Text>
        </View>
      );

    case "gameOver":
      return (
        <View style={styles.gameMessageOverlay}>
          <Text style={styles.gameStatusText}>Game Over</Text>
          <Text style={styles.gameSubtext}>Plays left: {playsLeft}</Text>
          <View style={styles.highScoreRow}>
            <Text style={styles.gameSubtext}>High Score: {highScore ?? 0}</Text>
            <Image
              source={preyImg}
              style={styles.preyIcon}
              resizeMode="contain"
            />
          </View>
          <Button
            onPress={onStartNewGame}
            title="Play again"
            style={styles.playButtonContainer}
          />
        </View>
      );

    case "welcome":
      return (
        <View style={styles.gameMessageOverlay}>
          <Text style={styles.gameStatusText}>Welcome to Seascape!</Text>

          <View style={styles.instructionsRow}>
            <Text style={styles.gameSubtext}>Avoid</Text>
            <Image
              source={predatorImg}
              style={styles.iconInlinePredator}
              resizeMode="contain"
            />
            <Text style={styles.gameSubtext}> and collect</Text>
            <Image
              source={preyImg}
              style={styles.iconInlinePrey}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.gameSubtext}>before you run out of plays.</Text>

          <Text style={[styles.gameSubtext, { paddingTop: 20 }]}>
            Tap or hold to swim up.
          </Text>

          <Text style={[styles.gameSubtext, { paddingTop: 20 }]}>
            Plays left: {playsLeft}
          </Text>

          <Button
            onPress={onStartNewGame}
            title="Play"
            style={styles.playButtonContainer}
          />
        </View>
      );

    case "start":
      return (
        <View style={styles.gameMessageOverlay}>
          <View style={styles.instructionsRow}>
            <Text style={styles.gameStatusText}>Welcome back!</Text>
            <Image
              source={preyImg}
              style={styles.iconInlinePrey}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.gameSubtext}>Plays left: {playsLeft}</Text>
          <Button
            onPress={onStartNewGame}
            title="Play"
            style={styles.playButtonContainer}
          />
        </View>
      );

    case "none":
    default:
      return null;
  }
}

import { StyleSheet } from "react-native";
const styles = StyleSheet.create({
  gameMessageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    paddingHorizontal: 30,
  },
  gameStatusText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  gameSubtext: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
  },
  highScoreRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  preyIcon: {
    width: 24,
    height: 24,
    marginHorizontal: 6,
  },
  instructionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: "transparent",
  },
  iconInlinePredator: {
    width: 20,
    height: 20,
    marginLeft: 6,
    marginRight: 2,
  },
  iconInlinePrey: {
    width: 24,
    height: 24,
    marginLeft: 6,
    marginRight: 2,
  },
  playButtonContainer: {
    marginTop: 24,
  },
});
