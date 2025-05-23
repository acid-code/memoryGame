# Memory Game

A React Native Expo application for creating and playing memory card games. Import cards from text files, play memory games, and track your progress.

## Features

- Import cards from text files (PDF support coming soon)
- Create and manage multiple card sets
- Play memory games with scoring
- Browse cards in a set
- Track best scores
- Local storage for card sets
- Export/Import functionality for sharing sets

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd memoryGame
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on Android:
```bash
npm run android
```

## Usage

### Creating Card Sets

1. Click "New Set" to create an empty set
2. Click "Import File" to import cards from a text file
   - Text files should have pairs of lines (front and back of cards)
   - Each pair should be separated by a newline

### Playing the Game

1. Select a card set from the home screen
2. Click "Start Game" in the browse view
3. Mark cards as correct or incorrect
4. Track your score and time
5. Try to beat your best score!

### Managing Cards

- Browse through cards using the navigation buttons
- Add new cards manually
- Remove cards from sets
- Export sets to share with others
- Import sets from other devices

## File Format

Text files should be formatted as follows:
```
Front of card 1
Back of card 1
Front of card 2
Back of card 2
...
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
