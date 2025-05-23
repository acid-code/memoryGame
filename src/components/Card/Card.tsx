import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
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

export const Card: React.FC<CardProps> = ({ card, onPress, isFlipped = false }) => {
  const [flipped, setFlipped] = useState(isFlipped);
  const rotation = useSharedValue(0);

  const flipCard = () => {
    setFlipped(!flipped);
    rotation.value = withSpring(flipped ? 0 : 180);
  };

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      rotation.value,
      [0, 180],
      [0, 180]
    );
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      opacity: interpolate(rotation.value, [0, 90], [1, 0]),
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      rotation.value,
      [0, 180],
      [180, 360]
    );
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      opacity: interpolate(rotation.value, [90, 180], [0, 1]),
    };
  });

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => {
        flipCard();
        onPress?.();
      }}
      style={styles.container}
    >
      <Animated.View style={[styles.card, frontAnimatedStyle]}>
        <Text style={styles.text}>{card.front}</Text>
      </Animated.View>
      <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
        <Text style={styles.text}>{card.back}</Text>
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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