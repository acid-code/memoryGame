import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring
} from 'react-native-reanimated';
import { Card as CardType } from '../../types';

interface CardProps {
  card: CardType;
  onPress?: () => void;
  isFlipped?: boolean;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

// Animation configuration
const SPRING_CONFIG = {
  damping: 15,
  stiffness: 100,
  mass: 0.5,
};

const SWAY_CONFIG = {
  damping: 20,
  stiffness: 200,
  mass: 0.3,
};

export const Card: React.FC<CardProps> = ({ card, onPress, isFlipped = false }) => {
  const [flipped, setFlipped] = useState(isFlipped);
  const rotation = useSharedValue(0);
  const translateX = useSharedValue(0);

  // Reset flip state when card changes
  useEffect(() => {
    // Start with sway animation immediately
    translateX.value = withSequence(
      withSpring(-20, SWAY_CONFIG),
      withSpring(0, SWAY_CONFIG)
    );

    // Reset rotation
    rotation.value = withSpring(0, SPRING_CONFIG);
    setFlipped(false);
  }, [card.id]);

  const flipCard = () => {
    setFlipped(!flipped);
    rotation.value = withSpring(flipped ? 0 : 180, SPRING_CONFIG);
  };

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      rotation.value,
      [0, 180],
      [0, 180]
    );
    return {
      transform: [
        { rotateY: `${rotateY}deg` },
        { translateX: translateX.value }
      ],
      opacity: interpolate(rotation.value, [0, 90, 90, 180], [1, 0, 0, 0]),
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      rotation.value,
      [0, 180],
      [180, 360]
    );
    return {
      transform: [
        { rotateY: `${rotateY}deg` },
        { translateX: translateX.value }
      ],
      opacity: interpolate(rotation.value, [0, 90, 90, 180], [0, 0, 1, 1]),
    };
  });

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => {
        flipCard();
        // Wait 300ms before triggering navigation
        setTimeout(() => {
          onPress?.();
        }, 800);
      }}
      style={styles.container}
    >
      <Animated.View style={[styles.card, frontAnimatedStyle]}>
        <Text style={styles.text}>{card.front}</Text>
      </Animated.View>
      <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
        <Text style={styles.text}>
          {flipped ? card.back : ''}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    margin: 10,
  },
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    position: 'absolute',
    backfaceVisibility: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBack: {
    backgroundColor: '#f0f0f0',
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
  },
}); 