import { View, ActivityIndicator, StyleSheet, useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

export function Loader() {
  const colorScheme = useColorScheme();
  const color = colorScheme === 'dark' ? Colors.custom.blue : Colors.custom.lightBlue;

  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    backgroundColor: 'transparent',
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
});