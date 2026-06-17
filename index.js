// 1. Polyfill DOMException manuellement AVANT tout le reste.
// Hermes ne l'expose pas globalement. Supabase/undici/node-fetch en ont besoin.
if (typeof global.DOMException === 'undefined') {
  // Version minimaliste compatible Hermes
  global.DOMException = class DOMException extends Error {
    constructor(message, name) {
      super(message);
      this.name = name || 'Error';
    }
  };
}

// 2. URL polyfill (doit venir après DOMException)
import 'react-native-url-polyfill/auto';

// 3. Point d'entrée expo-router
import 'expo-router/entry';
