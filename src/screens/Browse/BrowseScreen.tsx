import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { Card } from '../../components/Card/Card';
import { RootState } from '../../store';
import { NavigationProp } from '../../types/navigation';

export const BrowseScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const { setId } = route.params as { setId: string };
  const [currentIndex, setCurrentIndex] = useState(0);

  const cardSet = useSelector((state: RootState) =>
    state.cardSets.sets.find(set => set.id === setId)
  );

  if (!cardSet) {
    return (
      <View style={styles.container}>
        <Text>Set not found</Text>
      </View>
    );
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < cardSet.cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleStartGame = () => {
    navigation.navigate('Game', { setId });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{cardSet.name}</Text>
        <TouchableOpacity
          style={styles.gameButton}
          onPress={handleStartGame}
        >
          <Icon name="play-arrow" size={24} color="#fff" />
          <Text style={styles.buttonText}>Start Game</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardContainer}>
        {cardSet.cards.length > 0 ? (
          <Card card={cardSet.cards[currentIndex]} />
        ) : (
          <Text style={styles.emptyText}>No cards in this set</Text>
        )}
      </View>

      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, currentIndex === 0 && styles.disabledButton]}
          onPress={handlePrevious}
          disabled={currentIndex === 0}
        >
          <Icon name="chevron-left" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.counter}>
          {currentIndex + 1} / {cardSet.cards.length}
        </Text>

        <TouchableOpacity
          style={[
            styles.navButton,
            currentIndex === cardSet.cards.length - 1 && styles.disabledButton
          ]}
          onPress={handleNext}
          disabled={currentIndex === cardSet.cards.length - 1}
        >
          <Icon name="chevron-right" size={24} color="#fff" />
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
  gameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4511e',
    padding: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  navButton: {
    backgroundColor: '#f4511e',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  counter: {
    fontSize: 16,
    color: '#333',
    marginHorizontal: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
}); 