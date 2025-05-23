import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '../../components/Card/Card';
import { RootState } from '../../store';
import { updateBestScore } from '../../store/slices/cardSetsSlice';
import { NavigationProp } from '../../types/navigation';

export const GameScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();
  const { setId } = route.params as { setId: string };
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const cardSet = useSelector((state: RootState) =>
    state.cardSets.sets.find(set => set.id === setId)
  );

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

  if (!cardSet) {
    return (
      <View style={styles.container}>
        <Text>Set not found</Text>
      </View>
    );
  }

  const handleCorrect = () => {
    setScore(score + 1);
    if (currentIndex < cardSet.cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleGameEnd();
    }
  };

  const handleIncorrect = () => {
    if (currentIndex < cardSet.cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleGameEnd();
    }
  };

  const handleGameEnd = () => {
    const finalScore = Math.round((score / cardSet.cards.length) * 100);
    dispatch(updateBestScore({ setId, score: finalScore }));
    
    Alert.alert(
      'Game Over',
      `Your score: ${finalScore}%\nTime: ${elapsedTime} seconds`,
      [
        {
          text: 'Play Again',
          onPress: () => {
            setCurrentIndex(0);
            setScore(0);
            setStartTime(Date.now());
            setElapsedTime(0);
          },
        },
        {
          text: 'Back to Set',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Score: {score}</Text>
        <Text style={styles.timer}>Time: {elapsedTime}s</Text>
      </View>

      <View style={styles.cardContainer}>
        <Card card={cardSet.cards[currentIndex]} />
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