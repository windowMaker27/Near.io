/**
 * rn-event-native.js
 * Remplace node_modules/react-native/src/private/webapis/dom/events/Event.js
 * sur RN 0.85 + New Arch + Hermes.
 *
 * Ce fichier tente d'assigner Event.NONE = 0 etc. sur global.Event
 * dont les proprietes sont non-writable sur Hermes New Arch -> crash.
 *
 * On re-exporte global.Event sans toucher aux constantes statiques.
 */
'use strict';

// global.Event est defini nativement par Hermes New Arch avec
// NONE=0, CAPTURING_PHASE=1, AT_TARGET=2, BUBBLING_PHASE=3 deja presentes.
// On l'exporte tel quel.
module.exports = global.Event;
module.exports.default = global.Event;
