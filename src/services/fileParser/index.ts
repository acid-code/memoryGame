import * as DocumentPicker from 'expo-document-picker';
import { Card } from '../../types';

export const pickDocument = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['text/plain', 'application/pdf'],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled) return null;
    // Expo's DocumentPicker returns an array in result.assets
    return result.assets[0];
  } catch (err) {
    console.error('Error picking document:', err);
    return null;
  }
};

export const parseTextFile = async (uri: string): Promise<Card[]> => {
  try {
    const response = await fetch(uri);
    const text = await response.text();
    
    // Split text into lines and create cards
    const lines = text.split('\n').filter(line => line.trim());
    const cards: Card[] = [];
    
    for (let i = 0; i < lines.length; i += 2) {
      if (i + 1 < lines.length) {
        cards.push({
          id: `card_${Date.now()}_${i}`,
          front: lines[i].trim(),
          back: lines[i + 1].trim(),
          set: '',
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        });
      }
    }
    
    return cards;
  } catch (error) {
    console.error('Error parsing text file:', error);
    return [];
  }
};

export const parsePdfFile = async (uri: string): Promise<Card[]> => {
  // PDF parsing will be implemented later
  // For now, return empty array
  console.log('PDF parsing not implemented yet');
  return [];
};

export const parseFile = async (file: any | null): Promise<Card[]> => {
  if (!file) return [];

  switch (file.mimeType) {
    case 'text/plain':
      return parseTextFile(file.uri);
    case 'application/pdf':
      return parsePdfFile(file.uri);
    default:
      console.error('Unsupported file type:', file.mimeType);
      return [];
  }
}; 