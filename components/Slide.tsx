import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, ImageSourcePropType, Image } from 'react-native';
import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';

type SlideProps = {
  title?: string;
  body: string;
  icon?: React.ReactElement | ImageSourcePropType;
};

export default function Slide({ title, body, icon }: SlideProps) {
  const translateY = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    const timeout = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(timeout);
  }, [body]);

  useEffect(() => {
    if (!ready) return;
    translateY.setValue(20);
    opacity.setValue(0);
    scale.setValue(0.8);

    Animated.sequence([
      Animated.delay(100),
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, friction: 7, tension: 60, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
      ]),
    ]).start();
  }, [ready, body]);

  if (!ready) return null;

  return (
    <Animated.View style={[styles.card, { transform: [{ translateY }], opacity }]}>
      {icon && (
        <Animated.View style={[styles.icon, { transform: [{ scale }] }]}>
          {React.isValidElement(icon) ? (
            icon
          ) : (
            <Image source={icon as ImageSourcePropType} style={styles.imageIcon} />
          )}
        </Animated.View>
      )}
      {title && <Text style={styles.title}>{title}</Text>}
      <Text style={styles.body}>{body}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(123,182,212,0.4)',
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignSelf: 'center',
    maxWidth: 320,
  },
  title: {
    fontSize: 20,
    fontWeight: 600,
    color: Colors.custom.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    color: Colors.custom.white,
    textAlign: 'center',
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 4,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },

  imageIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    alignSelf: 'center',
  },
});