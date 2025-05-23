import { useNavigation } from '@react-navigation/native';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { parseFile, pickDocument } from '../../services/fileParser';
import { RootState } from '../../store';
import { addCardSet } from '../../store/slices/cardSetsSlice';
import { CardSet } from '../../types';
import { NavigationProp } from '../../types/navigation';

export const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();
  const cardSets = useSelector((state: RootState) => state.cardSets.sets);

  const handleImportFile = async () => {
    try {
      const file = await pickDocument();
      if (!file) return;

      const cards = await parseFile(file);
      if (cards.length === 0) {
        Alert.alert('Error', 'No cards could be created from the file.');
        return;
      }

      const newSet: CardSet = {
        id: `set_${Date.now()}`,
        name: file.name?.replace('.json', '').replace('.txt', '') || 'Imported Set',
        cards,
        bestScore: 0,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };

      dispatch(addCardSet(newSet));
      Alert.alert('Success', `Created ${cards.length} cards from ${file.name || 'the file'}`);
    } catch (error) {
      console.error('Error importing file:', error);
      Alert.alert('Error', 'Failed to import file');
    }
  };

  const handleCreateNewSet = () => {
    const newSet: CardSet = {
      id: `set_${Date.now()}`,
      name: 'New Set',
      cards: [],
      bestScore: 0,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    dispatch(addCardSet(newSet));
    navigation.navigate('Browse', { setId: newSet.id });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleImportFile}
        >
          <Icon name="file-upload" size={24} color="#fff" />
          <Text style={styles.buttonText}>Import Set</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleCreateNewSet}
        >
          <Icon name="add" size={24} color="#fff" />
          <Text style={styles.buttonText}>New Set</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.setsList}>
        {cardSets.map((set) => (
          <TouchableOpacity
            key={set.id}
            style={styles.setCard}
            onPress={() => navigation.navigate('Browse', { setId: set.id })}
          >
            <View style={styles.setInfo}>
              <Text style={styles.setName}>{set.name}</Text>
              <Text style={styles.setStats}>
                {set.cards.length} cards • Best: {set.bestScore}
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        ))}
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
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4511e',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  setsList: {
    flex: 1,
    padding: 16,
  },
  setCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  setInfo: {
    flex: 1,
  },
  setName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  setStats: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
}); 