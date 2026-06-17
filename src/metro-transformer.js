/**
 * metro-transformer.js
 * Wrapper autour du transformer Babel par defaut d'Expo.
 * Intercepte le source de @supabase/supabase-js (bundle UMD) et remplace
 * installAbortSignalPatch par une fonction no-op avant compilation.
 *
 * Pourquoi : Hermes + New Arch sur RN 0.85 expose AbortSignal natif mais
 * .timeout n'est pas encore disponible au moment ou Supabase s'initialise
 * (top-level require). Le patch Supabase est inutile sur Hermes, on le court-circuite.
 */
'use strict';

const upstreamTransformer = require('@expo/metro-config/build/serializer/transform-worker');

module.exports.transform = async function (params) {
  const { filename, src } = params;

  // Cibler uniquement le bundle UMD de supabase-js
  if (
    filename.includes('@supabase/supabase-js') &&
    src.includes('installAbortSignalPatch')
  ) {
    // Remplacer la fonction par une no-op
    // La signature dans le bundle UMD est : function installAbortSignalPatch(e) { ... }
    // On la remplace par un stub vide qui accepte n'importe quel argument
    const patched = src.replace(
      /function installAbortSignalPatch\s*\([^)]*\)\s*\{[^}]*(?:\{[^}]*\}[^}]*)*\}/g,
      'function installAbortSignalPatch() { /* no-op: AbortSignal natif sur Hermes */ }'
    );
    return upstreamTransformer.transform({ ...params, src: patched });
  }

  return upstreamTransformer.transform(params);
};
