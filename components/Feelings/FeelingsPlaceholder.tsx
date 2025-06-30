import { Pressable, StyleSheet, Image, useColorScheme } from 'react-native';
import { View, Text } from '@/components/Themed';
import { useRouter } from 'expo-router';

export default function FeelingsPlaceholder() {
  const colorScheme = useColorScheme();

  const router = useRouter();

  const backgroundColorBox = colorScheme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)';
  const textColor = colorScheme === 'dark' ? '#fff' : '#444';

  return (
    <View>
      <View style={styles.container}>
        <View style={styles.wrapper}>
          <View style={styles.imageContainer}>
            <Image
              source={require('@/assets/images/moon.png')}
              style={styles.image}
              resizeMode="cover"
            />
          </View>

          <View style={[styles.summaryBox, { backgroundColor: backgroundColorBox }]}>
            <Pressable onPress={() => router.push('/login')}>
              <Text style={[styles.noEntries, { color: textColor }]}>
                Log in to track your mood.
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderColor: 'rgba(123, 182, 212, 0.4)',
    borderWidth: 1,
  },
  wrapper: {
    width: '100%',
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  imageContainer: {
    flex: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  image: {
    width: '100%',
    height: '100%',
    aspectRatio: 6 / 5,
    alignSelf: 'flex-start',
  },
  summaryBox: {
    position: 'absolute',
    bottom: 16,
    width: '90%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginHorizontal: '5%',
    alignItems: 'center',
  },
  noEntries: {
    fontSize: 14,
    textAlign: 'center',
  },
});