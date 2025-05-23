import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { saveCardSets } from '../../services/storage';
import { Card, CardSet } from '../../types';

interface CardSetsState {
  sets: CardSet[];
  activeSet: string | null;
}

const initialState: CardSetsState = {
  sets: [],
  activeSet: null,
};

const cardSetsSlice = createSlice({
  name: 'cardSets',
  initialState,
  reducers: {
    addCardSet: (state, action: PayloadAction<Omit<CardSet, 'createdAt' | 'lastModified'>>) => {
      const now = new Date().toISOString();
      state.sets.push({
        ...action.payload,
        createdAt: now,
        lastModified: now
      });
      saveCardSets(state.sets);
    },
    removeCardSet: (state, action: PayloadAction<string>) => {
      state.sets = state.sets.filter(set => set.id !== action.payload);
      if (state.activeSet === action.payload) {
        state.activeSet = null;
      }
      saveCardSets(state.sets);
    },
    updateCardSet: (state, action: PayloadAction<Omit<CardSet, 'createdAt' | 'lastModified'>>) => {
      const index = state.sets.findIndex(set => set.id === action.payload.id);
      if (index !== -1) {
        const now = new Date().toISOString();
        state.sets[index] = {
          ...action.payload,
          createdAt: state.sets[index].createdAt,
          lastModified: now
        };
        saveCardSets(state.sets);
      }
    },
    addCard: (state, action: PayloadAction<{ setId: string; card: Omit<Card, 'createdAt' | 'lastModified'> }>) => {
      const set = state.sets.find(s => s.id === action.payload.setId);
      if (set) {
        const now = new Date().toISOString();
        set.cards.push({
          ...action.payload.card,
          createdAt: now,
          lastModified: now
        });
        set.lastModified = now;
        saveCardSets(state.sets);
      }
    },
    removeCard: (state, action: PayloadAction<{ setId: string; cardId: string }>) => {
      const set = state.sets.find(s => s.id === action.payload.setId);
      if (set) {
        set.cards = set.cards.filter(card => card.id !== action.payload.cardId);
        set.lastModified = new Date().toISOString();
        saveCardSets(state.sets);
      }
    },
    setActiveSet: (state, action: PayloadAction<string | null>) => {
      state.activeSet = action.payload;
    },
    updateBestScore: (state, action: PayloadAction<{ setId: string; score: number }>) => {
      const set = state.sets.find(s => s.id === action.payload.setId);
      if (set && action.payload.score > set.bestScore) {
        set.bestScore = action.payload.score;
        set.lastModified = new Date().toISOString();
        saveCardSets(state.sets);
      }
    },
  },
});

export const {
  addCardSet,
  removeCardSet,
  updateCardSet,
  addCard,
  removeCard,
  setActiveSet,
  updateBestScore,
} = cardSetsSlice.actions;

export default cardSetsSlice.reducer; 