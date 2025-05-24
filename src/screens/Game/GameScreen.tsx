import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '../../components/Card/Card';
import { RootState } from '../../store';
import { updateBestScore } from '../../store/slices/cardSetsSlice';
import { Card as CardType } from '../../types';
import { NavigationProp } from '../../types/navigation';

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
  
  const cardSet = useSelector((state: RootState) =>
    state.cardSets.sets.find(set => set.id === setId)
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledCards, setShuffledCards] = useState<CardType[]>([]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Initialize game
  useEffect(() => {
    if (cardSet) {
      setShuffledCards(shuffleArray(cardSet.cards));
    }
  }, [cardSet]);

  // Update elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const moveToNextCard = useCallback(() => {
    if (currentIndex < shuffledCards.length - 1) {
      setIsTransitioning(true);
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
      setIsTransitioning(false);
    } else {
      handleGameEnd();
    }
  }, [currentIndex, shuffledCards.length]);

  const handleCorrect = useCallback(() => {
    if (isTransitioning) return;
    setCorrectCount(prev => prev + 1);
    moveToNextCard();
  }, [moveToNextCard, isTransitioning]);

  const handleIncorrect = useCallback(() => {
    if (isTransitioning) return;
    moveToNextCard();
  }, [moveToNextCard, isTransitioning]);

  const handleGameEnd = useCallback(() => {
    const totalCards = shuffledCards.length;
    const accuracy = Math.round((correctCount / totalCards) * 100);
    
    if (accuracy > (cardSet?.bestScore || 0)) {
      dispatch(updateBestScore({ setId, score: accuracy }));
    }

    Alert.alert(
      'Game Complete!',
      `Time: ${elapsedTime} seconds\nCorrect: ${correctCount}/${totalCards}\nAccuracy: ${accuracy}%`,
      [
        {
          text: 'Play Again',
          onPress: () => {
            setShuffledCards(shuffleArray(cardSet?.cards || []));
            setCurrentIndex(0);
            setCorrectCount(0);
            setIsFlipped(false);
            setIsTransitioning(false);
          }
        },
        {
          text: 'Back to Sets',
          onPress: () => navigation.goBack()
        }
      ]
    );
  }, [correctCount, elapsedTime, shuffledCards.length, cardSet, setId, dispatch, navigation]);

  if (!cardSet) {
    return (
      <View style={styles.container}>
        <Text>Set not found</Text>
      </View>
    );
  }

  if (cardSet.cards.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No cards in this set</Text>
        <TouchableOpacity
          style={[styles.button, styles.addButton]}
          onPress={() => navigation.navigate('AddCards', { setId })}
        >
          <Icon name="add" size={24} color="#fff" />
          <Text style={styles.buttonText}>Add Cards</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentCard = shuffledCards[currentIndex];
  if (!currentCard) {
    return (
      <View style={styles.container}>
        <Text>Error loading card</Text>
      </View>
    );
  }

  const progress = `${currentIndex + 1}/${shuffledCards.length}`;
  const time = `${Math.floor(elapsedTime / 60)}:${(elapsedTime % 60).toString().padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progress}>{progress}</Text>
        <Text style={styles.timer}>{time}</Text>
      </View>

      <View style={styles.cardContainer}>
        <Card 
          card={currentCard} 
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped(!isFlipped)}
          onFlipComplete={() => setIsTransitioning(false)}
        />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, styles.incorrectButton]}
          onPress={handleIncorrect}
          activeOpacity={0.7}
          disabled={isTransitioning}
        >
          <Icon name="close" size={24} color="#fff" />
          <Text style={styles.buttonText}>Incorrect</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.correctButton]}
          onPress={handleCorrect}
          activeOpacity={0.7}
          disabled={isTransitioning}
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
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  progress: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  timer: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  controls: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  correctButton: {
    backgroundColor: '#4CAF50',
  },
  incorrectButton: {
    backgroundColor: '#f44336',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
  },
}); 