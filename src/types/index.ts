export interface Card {
  id: string;
  front: string;
  back: string;
  set: string;
  createdAt: string;
  lastModified: string;
}

export interface CardSet {
  id: string;
  name: string;
  cards: Card[];
  bestScore: number;
  createdAt: string;
  lastModified: string;
}

export interface GameState {
  currentSet: string;
  selectedCards: string[];
  score: number;
  time: number;
}

export interface RootState {
  cardSets: CardSet[];
  currentGame: GameState | null;
  activeSet: string | null;
} 