// DOMException shim — Hermes ne l'expose pas globalement, requis par Supabase
if (typeof global.DOMException === 'undefined') {
  global.DOMException = class DOMException extends Error {
    constructor(message, name) {
      super(message);
      this.name = name || 'Error';
    }
  };
}

// RN 0.85 + New Architecture + Hermes expose nativement URL, URLSearchParams et fetch.
// react-native-url-polyfill/auto est inutile et casse Event (read-only props sur Hermes).

import 'expo-router/entry';
