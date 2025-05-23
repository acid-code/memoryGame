import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  Game: { setId: string };
  Browse: { setId: string };
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>; 