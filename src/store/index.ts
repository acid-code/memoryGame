import { configureStore } from '@reduxjs/toolkit';
import cardSetsReducer from './slices/cardSetsSlice';

export const store = configureStore({
  reducer: {
    cardSets: cardSetsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 