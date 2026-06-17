// Sur RN 0.85 + New Arch + Hermes, EventTarget et Event sont natifs.
// abort-controller importe event-target-shim pour obtenir ces classes.
// On les re-exporte depuis le global Hermes pour eviter le crash
// "Cannot assign to read-only property" tout en permettant a abort-controller
// de faire `new EventTarget()` et `new Event()`.
'use strict';

const NativeEvent = global.Event;
const NativeEventTarget = global.EventTarget;

module.exports = {
  Event: NativeEvent,
  EventTarget: NativeEventTarget,
  defineEventAttribute: function() {}, // no-op
  default: NativeEventTarget,
};
