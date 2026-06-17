// Sur RN 0.85 + New Arch + Hermes, AbortController et AbortSignal sont natifs.
// On les re-exporte pour que les packages qui font `require('abort-controller')`
// (ex: @supabase/supabase-js) obtiennent les vraies classes natives.
module.exports = {
  AbortController: global.AbortController,
  AbortSignal: global.AbortSignal,
  default: global.AbortController,
};
