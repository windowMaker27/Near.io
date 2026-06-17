// Guard: empeche les polyfills de redefinir les props read-only de Event
// (NONE, CAPTURING_PHASE, AT_TARGET, BUBBLING_PHASE) sur Hermes + New Arch.
// Doit etre execute AVANT tout import, notamment avant expo/winter/runtime.
//  if (typeof global.Event !== 'undefined') {
//    const _defineProperty = Object.defineProperty;
//    Object.defineProperty = function(obj, prop, descriptor) {
//      if (obj === global.Event && ['NONE','CAPTURING_PHASE','AT_TARGET','BUBBLING_PHASE'].includes(prop)) {
//        return obj; // ignore silencieusement
//      }
//      return _defineProperty(obj, prop, descriptor);
//    };
//  }
//  
//  // DOMException shim - Hermes ne l'expose pas globalement
//  if (typeof global.DOMException === 'undefined') {
//    global.DOMException = class DOMException extends Error {
//      constructor(message, name) {
//        super(message);
//        this.name = name || 'Error';
//      }
//    };
//  }
//  
console.log("AbortSignal =", global.AbortSignal);
console.log("AbortController =", global.AbortController);

import 'expo-router/entry';
