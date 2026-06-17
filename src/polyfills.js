'use strict';

/**
 * polyfills.js - charge en PREMIER dans index.js
 *
 * Sur RN 0.85 + Hermes + New Arch, certains packages (ws, event-target-shim)
 * tentent d'assigner des proprietes statiques sur global.Event qui sont
 * DEFINIES comme non-writables par le runtime C++ Hermes.
 *
 * Ce guard intercepte ces tentatives d'assignation et les ignore.
 * Il doit etre charge avant tout autre module.
 */

// Guard Object.defineProperty pour les constantes Event read-only
// On l'installe le plus tot possible
(function installEventGuard() {
  var _define = Object.defineProperty;
  var EVENT_CONSTANTS = { NONE: true, CAPTURING_PHASE: true, AT_TARGET: true, BUBBLING_PHASE: true };
  Object.defineProperty = function patchedDefineProperty(obj, prop, descriptor) {
    // Bloquer les tentatives d'ecriture sur les constantes de global.Event
    if (
      typeof global !== 'undefined' &&
      typeof global.Event !== 'undefined' &&
      obj === global.Event &&
      EVENT_CONSTANTS[prop]
    ) {
      return obj; // no-op silencieux
    }
    return _define(obj, prop, descriptor);
  };

  // Intercepter aussi les assignations directes (Event.NONE = 0)
  // En rendant ces proprietes writable:false mais sans thrower
  if (typeof global !== 'undefined' && typeof global.Event !== 'undefined') {
    var EventCtor = global.Event;
    Object.keys(EVENT_CONSTANTS).forEach(function(key) {
      var existing = Object.getOwnPropertyDescriptor(EventCtor, key);
      if (existing && existing.writable === false && !existing.set) {
        // Remplacer par un setter silencieux
        try {
          _define(EventCtor, key, {
            get: function() { return existing.value; },
            set: function() { /* no-op */ },
            configurable: true,
            enumerable: existing.enumerable,
          });
        } catch (e) { /* si meme defineProperty echoue, on ne peut rien faire */ }
      }
    });
  }
})();

// DOMException shim
if (typeof global.DOMException === 'undefined') {
  global.DOMException = function DOMException(message, name) {
    this.message = message || '';
    this.name = name || 'Error';
    this.code = 0;
  };
  global.DOMException.prototype = Object.create(Error.prototype);
  global.DOMException.prototype.constructor = global.DOMException;
}

// AbortSignal.timeout shim
if (typeof global.AbortSignal !== 'undefined' && typeof global.AbortSignal.timeout !== 'function') {
  global.AbortSignal.timeout = function timeout(ms) {
    var ctrl = new global.AbortController();
    var id = setTimeout(function() {
      ctrl.abort(new global.DOMException('The operation timed out.', 'TimeoutError'));
    }, ms);
    ctrl.signal.addEventListener('abort', function() { clearTimeout(id); }, { once: true });
    return ctrl.signal;
  };
}
