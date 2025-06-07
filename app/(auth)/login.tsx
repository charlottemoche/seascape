import { View, Text, StyleSheet } from "react-native";

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>
        Login removed for now. Come back to it later.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001f33',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    fontSize: 18,
    color: '#cfe9f1',
    textAlign: 'center',
  },
});
