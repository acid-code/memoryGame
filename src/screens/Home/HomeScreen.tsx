import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { exportCardSet, parseFile, pickDocument } from '../../services/fileParser';
import { RootState } from '../../store';
import { addCardSet, removeCardSet, updateCardSet } from '../../store/slices/cardSetsSlice';
import { CardSet } from '../../types';
import { NavigationProp } from '../../types/navigation';

export const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();
  const cardSets = useSelector((state: RootState) => state.cardSets.sets);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [selectedSet, setSelectedSet] = useState<CardSet | null>(null);
  const [newName, setNewName] = useState('');

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

  const handleLongPress = (set: CardSet) => {
    Alert.alert(
      set.name,
      'What would you like to do?',
      [
        {
          text: 'Rename',
          onPress: () => {
            setSelectedSet(set);
            setNewName(set.name);
            setRenameModalVisible(true);
          },
        },
        {
          text: 'Export',
          onPress: () => handleExportSet(set),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDeleteSet(set),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleRename = () => {
    if (selectedSet && newName.trim()) {
      dispatch(updateCardSet({
        ...selectedSet,
        name: newName.trim(),
      }));
      setRenameModalVisible(false);
      setSelectedSet(null);
      setNewName('');
    }
  };

  const handleExportSet = async (set: CardSet) => {
    try {
      const fileUri = await exportCardSet(set);
      if (!fileUri) {
        Alert.alert('Error', 'Failed to export card set');
      }
    } catch (error) {
      console.error('Error exporting set:', error);
      Alert.alert('Error', 'Failed to export card set');
    }
  };

  const handleDeleteSet = (set: CardSet) => {
    Alert.alert(
      'Delete Set',
      `Are you sure you want to delete "${set.name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(removeCardSet(set.id));
          },
        },
      ]
    );
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
            onLongPress={() => handleLongPress(set)}
            delayLongPress={500}
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

      <Modal
        visible={renameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRenameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rename Set</Text>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter new name"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setRenameModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleRename}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  modalButton: {
    padding: 12,
    borderRadius: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  saveButton: {
    backgroundColor: '#2196F3',
  },
}); 