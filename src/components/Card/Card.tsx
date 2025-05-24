import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, {
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withSpring,
} from 'react-native-reanimated';
import { Card as CardType } from '../../types';

interface CardProps {
  card: CardType;
  isFlipped?: boolean;
  direction?: 'next' | 'prev';
  onFlip?: () => void;
  onFlipComplete?: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const CARD_HEIGHT = CARD_WIDTH * 1.4;
const MAX_FONT_SIZE = 24;
const MIN_FONT_SIZE = 12;

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

const getAdjustedFontSize = (text: string, isBack: boolean = false): number => {
  // For front text, use default size
  if (!isBack) return MAX_FONT_SIZE;
  
  // For back text, adjust based on length
  const length = text.length;
  if (length < 100) return MAX_FONT_SIZE;
  if (length < 200) return 20;
  if (length < 300) return 16;
  return MIN_FONT_SIZE;
};

export const Card: React.FC<CardProps> = ({ 
  card, 
  isFlipped = false, 
  direction = 'next', 
  onFlip,
  onFlipComplete 
}) => {
  const [flipped, setFlipped] = useState(isFlipped);
  const rotation = useSharedValue(0);
  const translateX = useSharedValue(0);

  // Reset flip state when card changes
  useEffect(() => {
    // Start with sway animation immediately
    const swayAmount = direction === 'next' ? -20 : 20;
    translateX.value = withSequence(
      withSpring(swayAmount, SWAY_CONFIG),
      withSpring(0, SWAY_CONFIG)
    );

    // Reset rotation
    rotation.value = withSpring(0, SPRING_CONFIG);
    setFlipped(false);
  }, [card.id, direction]);

  const flipCard = () => {
    if (onFlip) {
      onFlip();
    }
    
    setFlipped(!flipped);
    rotation.value = withSequence(
      withSpring(flipped ? 0 : 180, SPRING_CONFIG),
      withDelay(800, withSpring(flipped ? 0 : 180, SPRING_CONFIG, () => {
        if (onFlipComplete) {
          runOnJS(onFlipComplete)();
        }
      }))
    );
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
      onPress={flipCard}
      style={styles.container}
    >
      <Animated.View style={[styles.card, frontAnimatedStyle]}>
        <Text style={[styles.text, { fontSize: getAdjustedFontSize(card.front) }]}>
          {card.front}
        </Text>
      </Animated.View>
      <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
        <Text style={[styles.text, { fontSize: getAdjustedFontSize(card.back, true) }]}>
          {card.back}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBack: {
    backgroundColor: '#f8f8f8',
  },
  text: {
    textAlign: 'center',
    color: '#333',
    lineHeight: 28,
  },
}); 