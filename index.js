// === GUARDS HERMES / NEW ARCH ===
// Doit s'executer AVANT tout import, notamment expo/winter/runtime.

// 1. Guard Event read-only
//    Certains shims tentent Object.defineProperty(Event, 'NONE', ...) sur une
//    propriete gelee par Hermes -> crash. On intercepte silencieusement.
if (typeof global.Event !== 'undefined') {
  const _defineProperty = Object.defineProperty;
  Object.defineProperty = function (obj, prop, descriptor) {
    if (
      obj === global.Event &&
      ['NONE', 'CAPTURING_PHASE', 'AT_TARGET', 'BUBBLING_PHASE'].includes(prop)
    ) {
      return obj; // ignore silencieusement
    }
    return _defineProperty(obj, prop, descriptor);
  };
}

// 2. Guard AbortSignal.timeout
//    Supabase appelle installAbortSignalPatch -> AbortSignal.timeout(n)
//    Sur certaines versions Hermes, .timeout est absent ou undefined au moment
//    ou ce code s'execute. On le definit si necessaire.
if (typeof global.AbortSignal !== 'undefined' && typeof global.AbortSignal.timeout !== 'function') {
  global.AbortSignal.timeout = function (ms) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(new DOMException('TimeoutError', 'TimeoutError')), ms);
    return controller.signal;
  };
}

// 3. DOMException shim - Hermes ne l'expose pas toujours globalement
if (typeof global.DOMException === 'undefined') {
  global.DOMException = class DOMException extends Error {
    constructor(message, name) {
      super(message);
      this.name = name || 'Error';
    }
  };
}

import 'expo-router/entry';
