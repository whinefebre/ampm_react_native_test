# Location Tracker App

A React Native application that tracks and displays the user's current location using GPS coordinates and displays it on a map.

## Features

- Real-time GPS location tracking
- Interactive map display with current location marker
- Address display using reverse geocoding
- Light/Dark theme support
- "My Location" button to re-center the map
- Permission handling for location access
- Cross-platform support (iOS & Android)

## Tech Stack

- React Native
- Expo
- React Native Maps
- TypeScript
- React Navigation
- Expo Location

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Emulator

## Setup Instructions

1. Clone the repository:
```bash
git clone [repository-url]
cd [repository-name]
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npx expo start
```

4. Run on your preferred platform:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your physical device

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── screens/        # Screen components
  ├── hooks/          # Custom React hooks
  ├── types/          # TypeScript type definitions
  ├── theme/          # Theme configuration
  ├── utils/          # Utility functions
  └── constants/      # Constant values
```

## Design Choices

- Used TypeScript for better type safety and developer experience
- Implemented custom hooks for location management
- Utilized React Navigation for screen management
- Implemented theme support for better user experience
- Used React Native Maps for reliable map functionality
- Implemented proper error handling and loading states

## Testing

The app includes basic test coverage for core functionality. To run tests:

```bash
npm test
```

## Demo

You can try the app on Expo Snack: [Add your Expo Snack URL here]

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 