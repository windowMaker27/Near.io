// Doit être le premier fichier exécuté — avant tout module React Native.
// Hermes ne définit pas DOMException nativement, ce polyfill doit
// s'exécuter AVANT setUpDefaultReactNativeEnvironment.
import 'react-native-url-polyfill/auto';

// Point d'entrée expo-router
import 'expo-router/entry';
