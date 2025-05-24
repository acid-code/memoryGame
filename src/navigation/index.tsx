import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AddCardsScreen } from '../screens/AddCards/AddCardsScreen';
import { BrowseScreen } from '../screens/Browse/BrowseScreen';
import { GameScreen } from '../screens/Game/GameScreen';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { ImportCardsScreen } from '../screens/ImportCards/ImportCardsScreen';
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="Browse" component={BrowseScreen} />
        <Stack.Screen name="AddCards" component={AddCardsScreen} />
        <Stack.Screen name="ImportCards" component={ImportCardsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 