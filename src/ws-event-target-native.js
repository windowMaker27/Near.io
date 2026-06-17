/**
 * ws-event-target-native.js
 * Remplace ws/lib/event-target.js sur RN 0.85 + Hermes + New Arch.
 *
 * Le fichier original tente d'assigner Event.NONE / CAPTURING_PHASE /
 * AT_TARGET / BUBBLING_PHASE qui sont des proprietes read-only gelees
 * par le runtime C++ Hermes sur New Arch -> "Cannot assign to read-only property 'NONE'"
 *
 * On re-exporte les classes Event/EventTarget/MessageEvent natives
 * sans re-definir les constantes statiques.
 */
'use strict';

// Classe Event native Hermes - les constantes NONE etc. sont deja presentes
var NativeEvent = global.Event || (function FallbackEvent(type, init) {
  this.type = type;
  this.target = null;
  this.currentTarget = null;
  this.bubbles = !!(init && init.bubbles);
  this.cancelable = !!(init && init.cancelable);
  this.defaultPrevented = false;
  this.isTrusted = false;
  this.timeStamp = Date.now();
});

// MessageEvent : ws l'etend pour les messages WebSocket
var MessageEvent = global.MessageEvent || (function MessageEvent(type, init) {
  NativeEvent.call(this, type, init);
  this.data = (init && init.data !== undefined) ? init.data : null;
  this.origin = (init && init.origin) ? init.origin : '';
  this.lastEventId = '';
  this.source = null;
  this.ports = [];
});
if (!global.MessageEvent) {
  MessageEvent.prototype = Object.create(NativeEvent.prototype);
  MessageEvent.prototype.constructor = MessageEvent;
}

// ErrorEvent
var ErrorEvent = global.ErrorEvent || (function ErrorEvent(type, init) {
  NativeEvent.call(this, type, init);
  this.message = (init && init.message) ? init.message : '';
  this.error = (init && init.error) ? init.error : null;
});
if (!global.ErrorEvent) {
  ErrorEvent.prototype = Object.create(NativeEvent.prototype);
  ErrorEvent.prototype.constructor = ErrorEvent;
}

// CloseEvent
var CloseEvent = global.CloseEvent || (function CloseEvent(type, init) {
  NativeEvent.call(this, type, init);
  this.code = (init && init.code) ? init.code : 0;
  this.reason = (init && init.reason) ? init.reason : '';
  this.wasClean = !!(init && init.wasClean);
});
if (!global.CloseEvent) {
  CloseEvent.prototype = Object.create(NativeEvent.prototype);
  CloseEvent.prototype.constructor = CloseEvent;
}

// EventTarget : ws utilise sa propre implementation
// On utilise le global natif s'il existe, sinon un shim minimal
var EventTarget = global.EventTarget || (function EventTarget() {
  this._listeners = {};
});

if (!global.EventTarget) {
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (!this._listeners[type]) this._listeners[type] = [];
    this._listeners[type].push({ listener: listener, options: options || {} });
  };
  EventTarget.prototype.removeEventListener = function(type, listener) {
    if (!this._listeners[type]) return;
    this._listeners[type] = this._listeners[type].filter(function(l) {
      return l.listener !== listener;
    });
  };
  EventTarget.prototype.dispatchEvent = function(event) {
    var listeners = this._listeners[event.type] || [];
    listeners.forEach(function(l) { l.listener.call(this, event); }, this);
    return !event.defaultPrevented;
  };
}

module.exports = {
  Event: NativeEvent,
  EventTarget: EventTarget,
  MessageEvent: MessageEvent,
  ErrorEvent: ErrorEvent,
  CloseEvent: CloseEvent,
};
