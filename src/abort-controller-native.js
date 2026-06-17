/**
 * abort-controller-native.js
 * Remplace le package npm abort-controller sur RN 0.85 + Hermes + New Arch.
 *
 * Probleme : quand Supabase charge ce module au top-level (avant que Hermes
 * ait fini son bootstrap), global.AbortSignal peut etre undefined OU exister
 * sans la methode statique .timeout.
 *
 * Solution : on expose AbortController/AbortSignal via des getters lazys
 * (evalues au premier acces, pas au require-time) ET on s'assure que
 * AbortSignal.timeout est toujours present.
 */
'use strict';

function getAbortController() {
  if (typeof global.AbortController !== 'undefined') return global.AbortController;
  // Fallback shim minimal
  function AC() {
    var self = this;
    this.signal = {
      aborted: false,
      reason: undefined,
      _cbs: [],
      addEventListener: function(t, cb) { if (t === 'abort') this._cbs.push(cb); },
      removeEventListener: function(t, cb) { this._cbs = this._cbs.filter(function(c){return c!==cb;}); },
      dispatchEvent: function() {},
      throwIfAborted: function() { if (this.aborted) throw this.reason; },
    };
    this.abort = function(reason) {
      if (self.signal.aborted) return;
      self.signal.aborted = true;
      self.signal.reason = reason !== undefined ? reason : new DOMException('AbortError', 'AbortError');
      self.signal._cbs.forEach(function(cb){ cb({ type: 'abort', target: self.signal }); });
    };
  }
  return AC;
}

function getAbortSignal() {
  var AS = typeof global.AbortSignal !== 'undefined' ? global.AbortSignal : null;
  if (AS && typeof AS.timeout !== 'function') {
    // .timeout manquant : on l'ajoute directement sur le constructeur natif
    try {
      AS.timeout = function timeout(ms) {
        var ctrl = new (getAbortController())();
        var id = setTimeout(function() {
          ctrl.abort(new DOMException('The operation timed out.', 'TimeoutError'));
        }, ms);
        ctrl.signal.addEventListener('abort', function() { clearTimeout(id); }, { once: true });
        return ctrl.signal;
      };
    } catch(e) { /* read-only dans certaines versions - on continuera avec le shim */ }
  }
  return AS || getAbortController().prototype.constructor; // fallback
}

// Assure que DOMException existe (requis par AbortSignal.timeout)
if (typeof global.DOMException === 'undefined') {
  global.DOMException = function DOMException(message, name) {
    this.message = message || '';
    this.name = name || 'Error';
    this.code = 0;
  };
  global.DOMException.prototype = Object.create(Error.prototype);
}

var _AC = null;
var _AS = null;

module.exports = {
  get AbortController() { return _AC || (_AC = getAbortController()); },
  get AbortSignal() { return _AS || (_AS = getAbortSignal()); },
  get default() { return _AC || (_AC = getAbortController()); },
};
