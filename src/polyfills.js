/**
 * polyfills.js — charge en PREMIER dans index.js (avant expo-router/entry)
 * Patch les globals manquants sur Hermes + New Arch au moment du bootstrap.
 */
'use strict';

// DOMException — absent du global Hermes dans certaines versions
if (typeof global.DOMException === 'undefined') {
  global.DOMException = class DOMException extends Error {
    constructor(message, name) {
      super(message);
      this.name = name || 'Error';
      this.code = 0;
    }
  };
}

// AbortSignal.timeout — Supabase (installAbortSignalPatch) appelle cette methode
// statique. Sur Hermes, AbortSignal existe mais .timeout peut etre absent
// au moment du premier require() avant que le runtime soit completement pret.
if (typeof global.AbortSignal !== 'undefined') {
  if (typeof global.AbortSignal.timeout !== 'function') {
    global.AbortSignal.timeout = function timeout(ms) {
      const controller = new global.AbortController();
      const id = setTimeout(function () {
        controller.abort(
          new global.DOMException('The operation was aborted due to timeout', 'TimeoutError')
        );
      }, ms);
      // Permet au GC de ne pas bloquer si le signal est annule avant le timeout
      const signal = controller.signal;
      signal.addEventListener('abort', function () { clearTimeout(id); }, { once: true });
      return signal;
    };
  }
} else {
  // AbortSignal n'existe pas encore du tout — on installe un shim complet
  function AbortSignalShim() {
    this.aborted = false;
    this.reason = undefined;
    this._listeners = [];
  }
  AbortSignalShim.prototype.addEventListener = function(type, cb) {
    if (type === 'abort') this._listeners.push(cb);
  };
  AbortSignalShim.prototype.removeEventListener = function(type, cb) {
    this._listeners = this._listeners.filter(function(l) { return l !== cb; });
  };
  AbortSignalShim.timeout = function(ms) {
    const ctrl = new AbortControllerShim();
    setTimeout(function() { ctrl.abort(); }, ms);
    return ctrl.signal;
  };

  function AbortControllerShim() {
    this.signal = new AbortSignalShim();
  }
  AbortControllerShim.prototype.abort = function(reason) {
    if (this.signal.aborted) return;
    this.signal.aborted = true;
    this.signal.reason = reason;
    this.signal._listeners.forEach(function(cb) { cb(); });
  };

  global.AbortSignal = AbortSignalShim;
  global.AbortController = AbortControllerShim;
}

// Event read-only guard
// Certains shims font Object.defineProperty(Event, 'NONE', ...) sur une
// propriete gelee par Hermes -> crash. On intercepte silencieusement.
if (typeof global.Event !== 'undefined') {
  const _def = Object.defineProperty;
  Object.defineProperty = function(obj, prop, descriptor) {
    if (
      obj === global.Event &&
      (prop === 'NONE' || prop === 'CAPTURING_PHASE' ||
       prop === 'AT_TARGET' || prop === 'BUBBLING_PHASE')
    ) {
      return obj;
    }
    return _def(obj, prop, descriptor);
  };
}
