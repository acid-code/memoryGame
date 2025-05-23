import AsyncStorage from '@react-native-async-storage/async-storage';
import { CardSet } from '../../types';

const STORAGE_KEY = '@memory_game_sets';

export const saveCardSets = async (sets: CardSet[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(sets);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving card sets:', error);
    throw error;
  }
};

export const loadCardSets = async (): Promise<CardSet[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue === null) {
      return [];
    }
    
    const sets = JSON.parse(jsonValue) as CardSet[];
    // Keep dates as strings
    return sets;
  } catch (error) {
    console.error('Error loading card sets:', error);
    return [];
  }
};

export const exportCardSet = async (set: CardSet): Promise<string> => {
  try {
    const jsonValue = JSON.stringify(set);
    return jsonValue;
  } catch (error) {
    console.error('Error exporting card set:', error);
    throw error;
  }
};

export const importCardSet = async (jsonValue: string): Promise<CardSet> => {
  try {
    const set = JSON.parse(jsonValue) as CardSet;
    // Keep dates as strings
    return set;
  } catch (error) {
    console.error('Error importing card set:', error);
    throw error;
  }
}; 