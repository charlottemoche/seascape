import React from "react";
import { View, Button } from "@/components/Themed";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DebugTools() {
  const router = useRouter();

  const checkStorage = async () => {
    const keys = await AsyncStorage.getAllKeys();
    console.log("AsyncStorage keys:", keys);
  };

  const removeOldKeys = async () => {
    await AsyncStorage.clear();
    console.log("Old keys removed");
    checkStorage();
  };

  const resetOnboarding = async () => {
    await AsyncStorage.removeItem("onboarding_completed");
    console.log("Onboarding reset");
  };

  return (
    <View style={{ padding: 20 }}>
      <Button
        title="Jump to Requests"
        onPress={() => {
          router.push({ pathname: "/profile", params: { tab: "requests" } });
        }}
      />
      <Button title="Check async storage" onPress={checkStorage} />
      <Button title="Remove old keys" onPress={removeOldKeys} />
      <Button title="Reset onboarding" onPress={resetOnboarding} />
    </View>
  );
}
