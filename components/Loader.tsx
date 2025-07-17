import { ActivityIndicator, StyleSheet } from "react-native";
import { View } from "@/components/Themed";
import Colors from "@/constants/Colors";

export function Loader() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={Colors.custom.blue} />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
});
