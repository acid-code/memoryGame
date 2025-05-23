import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '../../components/Card/Card';
import { exportCardSet } from '../../services/fileParser';
import { RootState } from '../../store';
import { removeCardSet } from '../../store/slices/cardSetsSlice';
import { NavigationProp } from '../../types/navigation';

export const BrowseScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();
  const { setId } = route.params as { setId: string };
  const [currentIndex, setCurrentIndex] = useState(0);
  const [navigationDirection, setNavigationDirection] = useState<'next' | 'prev'>('next');

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
      setNavigationDirection('prev');
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < cardSet.cards.length - 1) {
      setNavigationDirection('next');
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleStartGame = () => {
    navigation.navigate('Game', { setId });
  };

  const handleAddCards = () => {
    navigation.navigate('AddCards', { setId });
  };

  const handleExportSet = async () => {
    try {
      const fileUri = await exportCardSet(cardSet);
      if (!fileUri) {
        Alert.alert('Error', 'Failed to export card set');
        return;
      }
    } catch (error) {
      console.error('Error exporting set:', error);
      Alert.alert('Error', 'Failed to export card set');
    }
  };

  const handleDeleteSet = () => {
    Alert.alert(
      'Delete Set',
      `Are you sure you want to delete "${cardSet.name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(removeCardSet(setId));
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{cardSet.name}</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.button, styles.addButton]}
            onPress={handleAddCards}
          >
            <Icon name="add" size={24} color="#fff" />
            <Text style={styles.buttonText}>Add Cards</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.gameButton]}
            onPress={handleStartGame}
          >
            <Icon name="play-arrow" size={24} color="#fff" />
            <Text style={styles.buttonText}>Play</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.exportButton]}
            onPress={handleExportSet}
          >
            <Icon name="file-download" size={24} color="#fff" />
            <Text style={styles.buttonText}>Export</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDeleteSet}
          >
            <Icon name="delete" size={24} color="#fff" />
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardContainer}>
        {cardSet.cards.length > 0 ? (
          <Card 
            card={cardSet.cards[currentIndex]} 
            direction={navigationDirection}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No cards in this set</Text>
            <TouchableOpacity
              style={[styles.button, styles.addButton]}
              onPress={handleAddCards}
            >
              <Icon name="add" size={24} color="#fff" />
              <Text style={styles.buttonText}>Add Cards</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {cardSet.cards.length > 0 && (
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: '#4CAF50',
  },
  gameButton: {
    backgroundColor: '#2196F3',
  },
  exportButton: {
    backgroundColor: '#FF9800',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  navButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  counter: {
    fontSize: 16,
    color: '#666',
  },
}); 