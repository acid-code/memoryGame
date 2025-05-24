import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { Navigation } from './src/navigation';
import { loadCardSets } from './src/services/storage';
import { store } from './src/store';
import { addCardSet } from './src/store/slices/cardSetsSlice';

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

  return <Navigation />;
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
