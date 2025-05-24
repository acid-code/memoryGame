import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { parseFile, pickDocument } from '../../services/fileParser';
import { RootState } from '../../store';
import { addCard } from '../../store/slices/cardSetsSlice';
import { Card } from '../../types';
import { NavigationProp } from '../../types/navigation';

const MAX_CHARS = 80;

export const AddCardsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();
  const { setId } = route.params as { setId: string };
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [isAdding, setIsAdding] = useState(false);

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

  const handleAddCard = () => {
    if (!front.trim() || !back.trim()) {
      Alert.alert('Error', 'Both front and back text are required');
      return;
    }

    const frontLength = front.trim().length;
    const backLength = back.trim().length;

    if (frontLength > MAX_CHARS || backLength > MAX_CHARS) {
      Alert.alert(
        'Error',
        `Text is too long. Maximum ${MAX_CHARS} characters allowed.\n\nFront: ${frontLength} characters\nBack: ${backLength} characters`
      );
      return;
    }

    setIsAdding(true);

    try {
      const newCard: Card = {
        id: `card_${Date.now()}`,
        front: front.trim(),
        back: back.trim(),
        set: setId,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };

      dispatch(addCard({ setId, card: newCard }));
      setFront('');
      setBack('');
      
      Alert.alert(
        'Success',
        'Card added successfully',
        [
          {
            text: 'Add Another',
            onPress: () => setIsAdding(false),
          },
          {
            text: 'Done',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error adding card:', error);
      Alert.alert('Error', 'Failed to add card');
    } finally {
      setIsAdding(false);
    }
  };

  const handleImportFromSet = async () => {
    try {
      const file = await pickDocument();
      if (!file) return;

      const cards = await parseFile(file);
      if (cards.length === 0) {
        Alert.alert('Error', 'No cards could be created from the set file.');
        return;
      }

      // Validate character count for each card
      const invalidCards = cards.filter(
        card => card.front.trim().length > MAX_CHARS || card.back.trim().length > MAX_CHARS
      );

      if (invalidCards.length > 0) {
        Alert.alert(
          'Error',
          `${invalidCards.length} cards exceed the ${MAX_CHARS} character limit. Please edit the file and try again.`
        );
        return;
      }

      // Add each card to the set
      cards.forEach(card => {
        dispatch(addCard({
          setId,
          card: {
            id: card.id,
            front: card.front,
            back: card.back,
            set: setId
          }
        }));
      });

      Alert.alert(
        'Success',
        `Added ${cards.length} cards from ${file.name || 'the set file'}`,
        [
          {
            text: 'Add More',
            onPress: () => {},
          },
          {
            text: 'Done',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error importing set:', error);
      Alert.alert('Error', 'Failed to import set file');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Cards to {cardSet.name}</Text>
        <TouchableOpacity
          style={[styles.button, styles.importButton]}
          onPress={handleImportFromSet}
        >
          <Icon name="file-upload" size={24} color="#fff" />
          <Text style={styles.buttonText}>Import from Set</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Front</Text>
          <TextInput
            style={styles.input}
            value={front}
            onChangeText={setFront}
            placeholder="Enter front text"
            multiline
            editable={!isAdding}
            maxLength={MAX_CHARS}
          />
          <Text style={styles.wordCount}>
            {front.trim().length} / {MAX_CHARS} characters
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Back</Text>
          <TextInput
            style={styles.input}
            value={back}
            onChangeText={setBack}
            placeholder="Enter back text"
            multiline
            editable={!isAdding}
            maxLength={MAX_CHARS}
          />
          <Text style={styles.wordCount}>
            {back.trim().length} / {MAX_CHARS} characters
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.addButton, isAdding && styles.disabledButton]}
          onPress={handleAddCard}
          disabled={isAdding}
        >
          <Icon name="add" size={24} color="#fff" />
          <Text style={styles.buttonText}>
            {isAdding ? 'Adding...' : 'Add Card'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  wordCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  addButton: {
    backgroundColor: '#4CAF50',
  },
  importButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
}); 