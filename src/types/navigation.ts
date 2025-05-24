export type RootStackParamList = {
  Home: undefined;
  Game: { setId: string };
  Browse: { setId: string };
  AddCards: { setId: string };
  ImportCards: { setId: string };
};

export type NavigationProp = {
  navigate: (screen: keyof RootStackParamList, params?: any) => void;
  goBack: () => void;
}; 