import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '../../components/Card/Card';
import { RootState } from '../../store';
import { updateBestScore } from '../../store/slices/cardSetsSlice';
import { Card as CardType } from '../../types';
import { NavigationProp } from '../../types/navigation';

interface CardPerformance {
  cardId: string;
  correctCount: number;
  incorrectCount: number;
  lastAttempt: 'correct' | 'incorrect' | null;
}

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const GameScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();
  const { setId } = route.params as { setId: string };
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [shuffledCards, setShuffledCards] = useState<CardType[]>([]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardPerformance, setCardPerformance] = useState<Record<string, CardPerformance>>({});
  const [isPlaying, setIsPlaying] = useState(true);

  const cardSet = useSelector((state: RootState) =>
    state.cardSets.sets.find(set => set.id === setId)
  );

  // Initialize shuffled cards and card performance tracking
  useEffect(() => {
    if (cardSet) {
      const initialPerformance: Record<string, CardPerformance> = {};
      cardSet.cards.forEach(card => {
        initialPerformance[card.id] = {
          cardId: card.id,
          correctCount: 0,
          incorrectCount: 0,
          lastAttempt: null
        };
      });
      setCardPerformance(initialPerformance);
      setShuffledCards(shuffleArray(cardSet.cards));
    }
  }, [cardSet]);

  useEffect(() => {
    if (!startTime) {
      setStartTime(Date.now());
    }

    const timer = setInterval(() => {
      if (startTime) {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const calculateSuccessRate = () => {
    const totalAttempts = Object.values(cardPerformance).reduce(
      (sum, perf) => sum + perf.correctCount + perf.incorrectCount,
      0
    );
    if (totalAttempts === 0) return 0;
    const totalCorrect = Object.values(cardPerformance).reduce(
      (sum, perf) => sum + perf.correctCount,
      0
    );
    return (totalCorrect / totalAttempts) * 100;
  };

  const getNextCardSet = () => {
    const performanceArray = Object.values(cardPerformance);
    const strugglingCards = performanceArray
      .filter(perf => perf.incorrectCount > perf.correctCount)
      .map(perf => cardSet?.cards.find(card => card.id === perf.cardId))
      .filter((card): card is CardType => card !== undefined);

    const otherCards = cardSet?.cards.filter(
      card => !strugglingCards.some(sc => sc.id === card.id)
    ) || [];

    // Prioritize struggling cards but include some other cards for variety
    const nextSet = [
      ...shuffleArray(strugglingCards),
      ...shuffleArray(otherCards).slice(0, Math.max(3, Math.floor(otherCards.length / 2)))
    ];

    return shuffleArray(nextSet);
  };

  if (!cardSet) {
    return (
      <View style={styles.container}>
        <Text>Set not found</Text>
      </View>
    );
  }

  const handleCorrect = () => {
    const currentCard = shuffledCards[currentIndex];
    setCardPerformance(prev => ({
      ...prev,
      [currentCard.id]: {
        ...prev[currentCard.id],
        correctCount: prev[currentCard.id].correctCount + 1,
        lastAttempt: 'correct'
      }
    }));

    setScore(score + 1);
    if (currentIndex < shuffledCards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(currentIndex + 1);
    } else {
      handleRoundEnd();
    }
  };

  const handleIncorrect = () => {
    const currentCard = shuffledCards[currentIndex];
    setCardPerformance(prev => ({
      ...prev,
      [currentCard.id]: {
        ...prev[currentCard.id],
        incorrectCount: prev[currentCard.id].incorrectCount + 1,
        lastAttempt: 'incorrect'
      }
    }));

    if (currentIndex < shuffledCards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(currentIndex + 1);
    } else {
      handleRoundEnd();
    }
  };

  const handleRoundEnd = () => {
    const successRate = calculateSuccessRate();
    const roundScore = Math.round((score / shuffledCards.length) * 100);
    
    if (successRate === 100) {
      // Perfect mastery achieved
      dispatch(updateBestScore({ setId, score: 100 }));
      Alert.alert(
        'Perfect Mastery!',
        `Congratulations! You've mastered all cards!\nTime: ${elapsedTime} seconds`,
        [
          {
            text: 'Play Again',
            onPress: () => {
              setCurrentIndex(0);
              setScore(0);
              setStartTime(Date.now());
              setElapsedTime(0);
              setIsFlipped(false);
              setShuffledCards(shuffleArray(cardSet.cards));
              // Reset performance tracking
              const initialPerformance: Record<string, CardPerformance> = {};
              cardSet.cards.forEach(card => {
                initialPerformance[card.id] = {
                  cardId: card.id,
                  correctCount: 0,
                  incorrectCount: 0,
                  lastAttempt: null
                };
              });
              setCardPerformance(initialPerformance);
            },
          },
          {
            text: 'Back to Set',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      // Continue with next round
      Alert.alert(
        'Round Complete',
        `Round Score: ${roundScore}%\nOverall Success Rate: ${Math.round(successRate)}%`,
        [
          {
            text: 'Continue',
            onPress: () => {
              setCurrentIndex(0);
              setScore(0);
              setShuffledCards(getNextCardSet());
              setIsFlipped(false);
            },
          },
          {
            text: 'End Game',
            onPress: () => {
              dispatch(updateBestScore({ setId, score: Math.round(successRate) }));
              navigation.goBack();
            },
          },
        ]
      );
    }
  };

  const handleStopGame = () => {
    const successRate = calculateSuccessRate();
    dispatch(updateBestScore({ setId, score: Math.round(successRate) }));
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Score: {score}</Text>
        <Text style={styles.timer}>Time: {elapsedTime}s</Text>
        <TouchableOpacity onPress={handleStopGame} style={styles.stopButton}>
          <Icon name="stop" size={24} color="#f44336" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContainer}>
        {shuffledCards.length > 0 && (
          <Card 
            card={shuffledCards[currentIndex]} 
            isFlipped={isFlipped}
            direction="next"
          />
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, styles.incorrectButton]}
          onPress={handleIncorrect}
        >
          <Icon name="close" size={24} color="#fff" />
          <Text style={styles.buttonText}>Incorrect</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.correctButton]}
          onPress={handleCorrect}
        >
          <Icon name="check" size={24} color="#fff" />
          <Text style={styles.buttonText}>Correct</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  timer: {
    fontSize: 18,
    color: '#666',
  },
  stopButton: {
    padding: 8,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
    justifyContent: 'center',
  },
  correctButton: {
    backgroundColor: '#4CAF50',
  },
  incorrectButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 