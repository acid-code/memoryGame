import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Card, CardSet } from '../../types';

// Aspose Cloud API configuration
const ASPOSE_APP_SID = '225c1218-bbeb-4ffa-ad10-b098e9b4d5bc'; // Replace with your Aspose Cloud App SID
const ASPOSE_APP_KEY = 'c2a2427dfd435143633d7688dafe7e95'; // Replace with your Aspose Cloud App Key
const ASPOSE_API_URL = 'https://api.aspose.cloud/v3.0';

export const pickDocument = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['text/plain', 'application/json', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled) return null;
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
    
    // Split text into lines and filter out empty lines
    const lines = text.split('\n').filter(line => line.trim());
    const cards: Card[] = [];
    
    // Skip the header lines (Card Set, Created, Last Modified)
    let i = 0;
    while (i < lines.length && !lines[i].startsWith('Card 1:')) {
      i++;
    }
    
    // Process each card
    while (i < lines.length) {
      if (lines[i].startsWith('Card ')) {
        const question = lines[i + 1]?.replace('Question: ', '').trim();
        const answer = lines[i + 2]?.replace('Answer: ', '').trim();
        
        if (question && answer) {
          cards.push({
            id: `card_${Date.now()}_${cards.length}`,
            front: question,
            back: answer,
            set: '',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
          });
        }
        i += 3; // Move to next card
      } else {
        i++; // Skip any other lines
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

const convertDocxToText = async (uri: string): Promise<string> => {
  try {
    // Read the file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64
    });

    // Prepare the request to Aspose Cloud API
    const response = await fetch(`${ASPOSE_API_URL}/words/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-aspose-client': 'React Native App',
        'x-aspose-client-version': '1.0.0',
        'x-aspose-app-sid': ASPOSE_APP_SID,
        'x-aspose-app-key': ASPOSE_APP_KEY,
      },
      body: JSON.stringify({
        format: 'txt',
        document: base64
      })
    });

    if (!response.ok) {
      throw new Error('Failed to convert document');
    }

    const result = await response.json();
    return result.text;
  } catch (error) {
    console.error('Error converting DOCX to text:', error);
    throw error;
  }
};

export const parseFile = async (file: any | null): Promise<Card[]> => {
  if (!file) return [];

  try {
    switch (file.mimeType) {
      case 'text/plain':
        return parseTextFile(file.uri);
      case 'application/json':
        return parseJsonFile(file.uri);
      case 'application/pdf':
        return parsePdfFile(file.uri);
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        const text = await convertDocxToText(file.uri);
        // Save the converted text to a temporary file
        const tempUri = `${FileSystem.cacheDirectory}temp_${Date.now()}.txt`;
        await FileSystem.writeAsStringAsync(tempUri, text);
        return parseTextFile(tempUri);
      default:
        console.error('Unsupported file type:', file.mimeType);
        return [];
    }
  } catch (error) {
    console.error('Error parsing file:', error);
    return [];
  }
};

export const parseJsonFile = async (uri: string): Promise<Card[]> => {
  try {
    const response = await fetch(uri);
    const data = await response.json();
    if (data.cards && Array.isArray(data.cards)) {
      return data.cards.map((card: any) => ({
        ...card,
        id: `card_${Date.now()}_${Math.random()}`,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      }));
    }
    return [];
  } catch (error) {
    console.error('Error parsing JSON file:', error);
    return [];
  }
};

export const exportCardSet = async (cardSet: CardSet): Promise<string | null> => {
  try {
    // Format the data as a readable text file
    const textContent = [
      `Card Set: ${cardSet.name}`,
      `Created: ${new Date(cardSet.createdAt).toLocaleString()}`,
      `Last Modified: ${new Date(cardSet.lastModified).toLocaleString()}`,
      '\nCards:',
      ...cardSet.cards.map((card, index) => [
        `\nCard ${index + 1}:`,
        `Question: ${card.front}`,
        `Answer: ${card.back}`,
      ].join('\n'))
    ].join('\n');

    const fileName = `${cardSet.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.txt`;
    
    // Create the file in the cache directory
    const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, textContent);

    // Get file info to ensure it exists
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      throw new Error('Failed to create export file');
    }

    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Sharing is not available on this device');
    }

    // Share the file
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/plain',
      dialogTitle: `Export ${cardSet.name}`,
      UTI: 'public.plain-text' // iOS only
    });

    return fileUri;
  } catch (error) {
    console.error('Error exporting card set:', error);
    return null;
  }
}; 