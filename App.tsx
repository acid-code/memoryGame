import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { BrowseScreen } from './src/screens/Browse/BrowseScreen';
import { GameScreen } from './src/screens/Game/GameScreen';
import { HomeScreen } from './src/screens/Home/HomeScreen';
import { loadCardSets } from './src/services/storage';
import { store } from './src/store';
import { addCardSet } from './src/store/slices/cardSetsSlice';

const Stack = createNativeStackNavigator();

function AppContent() {
  useEffect(() => {
    const loadSavedSets = async () => {
      const sets = await loadCardSets();
      sets.forEach(set => {
        store.dispatch(addCardSet(set));
      });
    };
    loadSavedSets();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f4511e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Memory Game' }} 
        />
        <Stack.Screen 
          name="Game" 
          component={GameScreen} 
          options={{ title: 'Play Game' }} 
        />
        <Stack.Screen 
          name="Browse" 
          component={BrowseScreen} 
          options={{ title: 'Browse Sets' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </GestureHandlerRootView>
  );
}
