import { useNavigation, useRoute } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch } from 'react-redux';
import { addCard } from '../../store/slices/cardSetsSlice';
import { Card } from '../../types';
import { NavigationProp } from '../../types/navigation';

// API Configuration
const ASPOSE_API_URL = 'https://api.aspose.cloud/v4.0/words/convert';
const ASPOSE_APP_SID = '225c1218-bbeb-4ffa-ad10-b098e9b4d5bc';
const ASPOSE_APP_KEY = 'c2a2427dfd435143633d7688dafe7e95';
const ACCESS_TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYmYiOjE3NDgxMTY3ODYsImV4cCI6MTc0ODEyMDM4NiwiaXNzIjoiaHR0cHM6Ly9hcGkuYXNwb3NlLmNsb3VkIiwiYXVkIjpbImh0dHBzOi8vYXBpLmFzcG9zZS5jbG91ZC9yZXNvdXJjZXMiLCJhcGkuYmlsbGluZyIsImFwaS5pZGVudGl0eSIsImFwaS5wcm9kdWN0cyIsImFwaS5zdG9yYWdlIl0sImNsaWVudF9pZCI6IjIyNWMxMjE4LWJiZWItNGZmYS1hZDEwLWIwOThlOWI0ZDViYyIsImNsaWVudF9kZWZhdWx0X3N0b3JhZ2UiOiI2NTc2NWM0Mi1lYjM2LTQ5NmUtOWM0My1hMTM3NzYxNTAzNDgiLCJjbGllbnRfaWRlbnRpdHlfdXNlcl9pZCI6IjEwMzMxNjEiLCJzY29wZSI6WyJhcGkuYmlsbGluZyIsImFwaS5pZGVudGl0eSIsImFwaS5wcm9kdWN0cyIsImFwaS5zdG9yYWdlIl19.ol4LvzawTQ-Zt_uEDlqgpbKBrOLjodBuu24GUxcyG4oYNP03gQVk2XJrzvdqK6prwD-vr-mjcNDTe07wp9ExecWvckNXBAVDCaDdSah61GDa01e7bY6VmGqSR7jOvbZNWnhdhAtW8ixsicztLbeAYNh5JTvTk1a0OlTj1jaNdSAWAp1zZRQJCKIIS_XuHL4XRilxD57jITQ3ZUxqsgj_BK4K_kIeBwzToEfnpvRmrdLhKLRlFeOrSNQISWEO2BOXltwysW6ybpuxvHQD0T-unJ0TJZNGgGAcwp8QY38SNZu4VlraFn1hVN0MgGV48U4DeixhLWUi5FX_8PandVRE9w';

// Helper function for base64 encoding
const base64Encode = (str: string): string => {
  return btoa(unescape(encodeURIComponent(str)));
};

interface ParsingOptions {
  frontPrefix: string;
  frontSuffix: string;
  backPrefix: string;
  backSuffix: string;
  useRegex: boolean;
  frontRegex: string;
  backRegex: string;
}

const defaultParsingOptions: ParsingOptions = {
  frontPrefix: 'Question: ',
  frontSuffix: '',
  backPrefix: 'Answer: ',
  backSuffix: '',
  useRegex: true,
  frontRegex: 'Question: ([^\\n]+)\\nAnswer:',
  backRegex: 'Answer: ([^\\n]+)(?:\\n|$)',
};

const exampleContent = `Card 1:
Question: cyber cyber
Answer: cyber example

Card 2:
Question: סתם מילים
Answer: יאיי

Card 3:
Question: מסיון נוסף
Answer: סייבר`;

export const ImportCardsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const dispatch = useDispatch();
  const { setId } = route.params as { setId: string };

  const [fileContent, setFileContent] = useState<string>('');
  const [parsedCards, setParsedCards] = useState<Card[]>([]);
  const [parsingOptions, setParsingOptions] = useState<ParsingOptions>(defaultParsingOptions);
  const [fileName, setFileName] = useState<string>('');
  const [showExamples, setShowExamples] = useState(false);

  const extractTextFromFile = async (uri: string, mimeType: string | undefined): Promise<string> => {
    try {
      if (!mimeType) {
        throw new Error('File type not recognized');
      }

      // For .docx files, use Aspose Cloud API
      if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        try {
          // Read the file as binary data
          console.log('Reading file from URI:', uri);
          const fileContent = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64
          });
          console.log('File read successfully');

          // Create FormData and append the file
          const formData = new FormData();
          formData.append('file', {
            uri: uri,
            type: mimeType,
            name: 'document.docx'
          });

          // Prepare the request to Aspose Cloud API
          console.log('Sending request to Aspose API...');
          const apiResponse = await fetch(`${ASPOSE_API_URL}?format=txt`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${ACCESS_TOKEN}`,
              'Accept': 'application/json',
              'Content-Type': 'multipart/form-data'
            },
            body: formData
          });

          console.log('API Response status:', apiResponse.status);
          console.log('API Response headers:', JSON.stringify(apiResponse.headers));

          if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            console.error('Aspose API error response:', errorText);
            throw new Error(`API request failed: ${apiResponse.status} ${errorText}`);
          }

          // Get the text content directly since it's returned as application/octet-stream
          const text = await apiResponse.text();
          console.log('API Response received:', text);

          if (!text) {
            console.error('API response missing text content');
            throw new Error('API response missing text content');
          }
          return text;
        } catch (error) {
          console.error('Detailed error in docx processing:', error);
          if (error instanceof Error) {
            throw new Error(`DOCX processing failed: ${error.message}`);
          }
          throw error;
        }
      }

      // For text files, read directly
      if (mimeType === 'text/plain') {
        const content = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.UTF8
        });
        return content.trim();
      }

      // For JSON files, read and format
      if (mimeType === 'application/json') {
        const content = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.UTF8
        });
        const data = JSON.parse(content);
        if (data.cards && Array.isArray(data.cards)) {
          return data.cards
            .map((card: any) => `Question: ${card.front}\nAnswer: ${card.back}`)
            .join('\n\n');
        }
        return '';
      }

      throw new Error('Unsupported file type');
    } catch (error) {
      console.error('Error extracting text:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to extract text from file: ${error.message}`);
      }
      throw new Error('Failed to extract text from file');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'text/plain',
          'application/json',
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword'
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        setFileName(file.name);
        
        try {
          const text = await extractTextFromFile(file.uri, file.mimeType);
          console.log('Extracted text:', text);
          setFileContent(text);
          parseCards(text);
        } catch (error) {
          console.error('Error processing file:', error);
          Alert.alert('Error', 'Failed to process file. Please try a different file format.');
        }
      }
    } catch (err) {
      console.error('Pick document error:', err);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const parseCards = useCallback((content: string) => {
    try {
      let cards: Card[] = [];
      const now = new Date().toISOString();
      
      const frontRegex = new RegExp(parsingOptions.frontRegex, 'g');
      const backRegex = new RegExp(parsingOptions.backRegex, 'g');
      
      const frontMatches = [...content.matchAll(frontRegex)];
      const backMatches = [...content.matchAll(backRegex)];
      
      for (let i = 0; i < Math.min(frontMatches.length, backMatches.length); i++) {
        if (frontMatches[i] && backMatches[i] && frontMatches[i][1] && backMatches[i][1]) {
          const front = frontMatches[i][1].trim();
          const back = backMatches[i][1].trim();
          
          if (front && back) {
            cards.push({
              id: `imported-${Date.now()}-${i}`,
              front: front,
              back: back,
              createdAt: now,
              set: setId,
              lastModified: now,
            });
          }
        }
      }
      
      console.log('Parsed cards:', cards);
      setParsedCards(cards);
    } catch (error) {
      console.error('Parse error:', error);
      Alert.alert('Error', 'Failed to parse cards');
    }
  }, [parsingOptions, setId]);

  const handleImport = () => {
    if (parsedCards.length === 0) {
      Alert.alert('Error', 'No cards to import');
      return;
    }

    parsedCards.forEach(card => {
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

    Alert.alert('Success', `Imported ${parsedCards.length} cards`, [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const updateParsingOption = (key: keyof ParsingOptions, value: string | boolean) => {
    const newOptions = { ...parsingOptions, [key]: value };
    setParsingOptions(newOptions);
    if (fileContent) {
      parseCards(fileContent);
    }
  };

  const parseExampleContent = () => {
    setFileContent(exampleContent);
  };

  const handleRefresh = useCallback(() => {
    if (fileContent) {
      console.log('Refreshing with content:', fileContent);
      console.log('Using regex patterns:', parsingOptions.frontRegex, parsingOptions.backRegex);
      parseCards(fileContent);
    }
  }, [fileContent, parsingOptions, parseCards]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Import Cards</Text>
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity
          style={styles.importButton}
          onPress={pickDocument}
        >
          <Icon name="file-upload" size={24} color="#fff" />
          <Text style={styles.buttonText}>
            {fileName ? `Selected: ${fileName}` : 'Select File'}
          </Text>
        </TouchableOpacity>

        <View style={styles.optionsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Parsing Options</Text>
            <TouchableOpacity
              style={styles.exampleButton}
              onPress={() => setShowExamples(!showExamples)}
            >
              <Text style={styles.exampleButtonText}>
                {showExamples ? 'Hide Preview' : 'Show Preview'}
              </Text>
            </TouchableOpacity>
          </View>

          {showExamples && (
            <View style={styles.exampleContainer}>
              <Text style={styles.exampleTitle}>File Content Preview:</Text>
              <Text style={styles.exampleText}>
                {fileContent
                  ? fileContent.split('\n').slice(0, 10).join('\n') + (fileContent.split('\n').length > 10 ? '\n...' : '')
                  : exampleContent}
              </Text>
            </View>
          )}
          
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Edit Regex Pattern</Text>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                parsingOptions.useRegex && styles.toggleButtonActive
              ]}
              onPress={() => updateParsingOption('useRegex', !parsingOptions.useRegex)}
            >
              <Text style={styles.toggleButtonText}>
                {parsingOptions.useRegex ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
          </View>

          {!parsingOptions.useRegex ? (
            <>
              <View style={styles.prefixContainer}>
                <Text style={styles.prefixLabel}>Front Prefix:</Text>
                <TextInput
                  style={styles.prefixInput}
                  value={parsingOptions.frontPrefix}
                  onChangeText={(text) => {
                    const newOptions = {
                      ...parsingOptions,
                      frontPrefix: text,
                      frontRegex: `${text}([^\\n]+)${parsingOptions.frontSuffix}`
                    };
                    setParsingOptions(newOptions);
                    if (fileContent) {
                      parseCards(fileContent);
                    }
                  }}
                  placeholder="e.g., front: "
                />
              </View>

              <View style={styles.prefixContainer}>
                <Text style={styles.prefixLabel}>Front Suffix:</Text>
                <TextInput
                  style={styles.prefixInput}
                  value={parsingOptions.frontSuffix}
                  onChangeText={(text) => {
                    const newOptions = {
                      ...parsingOptions,
                      frontSuffix: text,
                      frontRegex: `${parsingOptions.frontPrefix}([^\\n]+)${text}`
                    };
                    setParsingOptions(newOptions);
                    if (fileContent) {
                      parseCards(fileContent);
                    }
                  }}
                  placeholder="e.g., ?"
                />
              </View>

              <View style={styles.prefixContainer}>
                <Text style={styles.prefixLabel}>Back Prefix:</Text>
                <TextInput
                  style={styles.prefixInput}
                  value={parsingOptions.backPrefix}
                  onChangeText={(text) => {
                    const newOptions = {
                      ...parsingOptions,
                      backPrefix: text,
                      backRegex: `${text}([^\\n]+)${parsingOptions.backSuffix}`
                    };
                    setParsingOptions(newOptions);
                    if (fileContent) {
                      parseCards(fileContent);
                    }
                  }}
                  placeholder="e.g., back: "
                />
              </View>

              <View style={styles.prefixContainer}>
                <Text style={styles.prefixLabel}>Back Suffix:</Text>
                <TextInput
                  style={styles.prefixInput}
                  value={parsingOptions.backSuffix}
                  onChangeText={(text) => {
                    const newOptions = {
                      ...parsingOptions,
                      backSuffix: text,
                      backRegex: `${parsingOptions.backPrefix}([^\\n]+)${text}`                    };
                    setParsingOptions(newOptions);
                    if (fileContent) {
                      parseCards(fileContent);
                    }
                  }}
                  placeholder="e.g., !"
                />
              </View>

              <View style={styles.regexSummaryContainer}>
                <Text style={styles.regexHint}>
                  Front Regex: {parsingOptions.frontRegex}
                </Text>
                <Text style={styles.regexHint}>
                  Back Regex: {parsingOptions.backRegex}
                </Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.prefixContainer}>
                <Text style={styles.prefixLabel}>Front Regex Pattern:</Text>
                <TextInput
                  style={styles.prefixInput}
                  value={parsingOptions.frontRegex}
                  onChangeText={(text) => {
                    const newOptions = {
                      ...parsingOptions,
                      frontRegex: text
                    };
                    setParsingOptions(newOptions);
                    if (fileContent) {
                      parseCards(fileContent);
                    }
                  }}
                  placeholder="e.g., front: ([^\\n]+)"
                />
              </View>

              <View style={styles.prefixContainer}>
                <Text style={styles.prefixLabel}>Back Regex Pattern:</Text>
                <TextInput
                  style={styles.prefixInput}
                  value={parsingOptions.backRegex}
                  onChangeText={(text) => {
                    const newOptions = {
                      ...parsingOptions,
                      backRegex: text
                    };
                    setParsingOptions(newOptions);
                    if (fileContent) {
                      parseCards(fileContent);
                    }
                  }}
                  placeholder="e.g., back: ([^\\n]+)"
                />
              </View>
            </>
          )}

          {parsingOptions.useRegex && (
            <TouchableOpacity
              style={[styles.toggleButton, styles.definitionButton]}
              onPress={() => {
                const newOptions = {
                  ...parsingOptions,
                  frontRegex: '(?:^|\\r?\\n\\r?\\n)([^\\r\\n]+)(?=\\r?\\n[^\\r\\n])',
                  backRegex: '(?:^|\\r?\\n\\r?\\n)[^\\r\\n]+\\r?\\n((?:[^\\r\\n]+(?:\\r?\\n(?!\\r?\\n\\r?\\n)[^\\r\\n]+)*?)(?=\\r?\\n\\r?\\n|$))'
                };
                setParsingOptions(newOptions);
                if (fileContent) {
                  parseCards(fileContent);
                }
              }}
            >
              <Text style={styles.toggleButtonText}>Use Definition File Pattern</Text>
            </TouchableOpacity>
          )}

          {fileContent && (
            <TouchableOpacity
              style={[styles.importButton, styles.refreshButton]}
              onPress={handleRefresh}
            >
              <Icon name="refresh" size={20} color="#fff" />
              <Text style={styles.buttonText}>Refresh Parsing</Text>
            </TouchableOpacity>
          )}
        </View>

        {parsedCards.length > 0 ? (
          <>
            <View style={styles.previewContainer}>
              <Text style={styles.sectionTitle}>Parsed Cards ({parsedCards.length} cards)</Text>
              {parsedCards.slice(0, 5).map((card, index) => (
                <View key={card.id} style={styles.previewCard}>
                  <Text style={styles.previewTitle}>Card {index + 1}</Text>
                  <Text style={styles.previewText}>Front: {card.front}</Text>
                  <Text style={styles.previewText}>Back: {card.back}</Text>
                </View>
              ))}
              {parsedCards.length > 5 && (
                <Text style={styles.moreCardsText}>
                  ... and {parsedCards.length - 5} more cards
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.importButton, styles.finishButton]}
              onPress={handleImport}
            >
              <Icon name="file-upload" size={24} color="#fff" />
              <Text style={styles.buttonText}>Import {parsedCards.length} Cards</Text>
            </TouchableOpacity>
          </>
        ) : fileContent ? (
          <View style={styles.previewContainer}>
            <Text style={styles.sectionTitle}>No cards found</Text>
            <Text style={styles.previewText}>
              Try adjusting the parsing options to match your file format.
            </Text>
          </View>
        ) : null}
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
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  exampleButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  exampleButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  exampleContainer: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  optionLabel: {
    fontSize: 16,
    color: '#333',
  },
  toggleButton: {
    backgroundColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  toggleButtonActive: {
    backgroundColor: '#4CAF50',
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 14,
  },
  previewContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  previewCard: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  moreCardsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  fileContentText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  prefixContainer: {
    marginBottom: 16,
  },
  prefixLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  prefixInput: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
  },
  regexHint: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginTop: 4,
    backgroundColor: '#f0f0f0',
    padding: 4,
    borderRadius: 4,
  },
  regexSummaryContainer: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  finishButton: {
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: '#4CAF50',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  definitionButton: {
    backgroundColor: '#4CAF50',
    marginTop: 8,
    marginBottom: 16,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
}); 
