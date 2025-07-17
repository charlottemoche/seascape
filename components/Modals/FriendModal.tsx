import React from "react";
import {
  Modal,
  StyleSheet,
  useColorScheme,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { removeFriend } from "@/lib/friendService";
import { View, Text, Button } from "@/components/Themed";
import Colors from "@/constants/Colors";

type Props = {
  visible: boolean;
  friendId: string;
  fishName: string;
  onClose: () => void;
  onRemoved?: (id: string) => void;
};

export default function FriendModal({
  visible,
  friendId,
  onClose,
  fishName,
  onRemoved,
}: Props) {
  const colorScheme = useColorScheme();

  const bg =
    colorScheme === "dark" ? Colors.custom.dark : Colors.light.background;
  const fog = colorScheme === "dark" ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.3)";
  const text = colorScheme === "dark" ? "#fff" : "#000";

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <TouchableWithoutFeedback onPress={() => onClose()}>
        <View style={[styles.overlay, { backgroundColor: fog }]} />
      </TouchableWithoutFeedback>

      <View style={[styles.card, { backgroundColor: bg }]}>
        <Text style={[styles.title, { color: text, marginBottom: 12 }]}>
          {`${fishName}'s Details`}
        </Text>

        <Button
          title="Remove friend"
          onPress={() =>
            Alert.alert(
              "Confirm Remove",
              "Are you sure you want to remove this friend?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Remove",
                  style: "destructive",
                  onPress: async () => {
                    await removeFriend(friendId);
                    onRemoved?.(friendId);
                    onClose();
                  },
                },
              ],
              { cancelable: true }
            )
          }
          variant="danger"
        />

        <View>
          <Button title="Close" onPress={() => onClose()} variant="plain" />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  card: {
    position: "absolute",
    top: "35%",
    left: "10%",
    right: "10%",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 6,
  },
  icon: {
    width: 40,
    height: 40,
    marginBottom: 16,
    resizeMode: "contain",
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    textAlign: "center",
  },
  replyText: {
    fontWeight: "500",
  },
});
