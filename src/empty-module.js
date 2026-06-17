// Stub vide : remplace whatwg-url sur RN 0.85 + New Arch + Hermes.
// URL et URLSearchParams sont natifs sur Hermes, ce stub evite le crash
// "Cannot assign to read-only property" cause par Object.defineProperty sur Event.
module.exports = {};
