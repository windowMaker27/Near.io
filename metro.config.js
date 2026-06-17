const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);
const emptyModule = path.resolve(__dirname, 'src/empty-module.js');
const eventTargetNative = path.resolve(__dirname, 'src/event-target-shim-native.js');
const abortControllerNative = path.resolve(__dirname, 'src/abort-controller-native.js');
const supabasePatch = path.resolve(__dirname, 'src/supabase-patch.js');

// Alias de modules via resolveRequest
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'whatwg-url' || moduleName.startsWith('whatwg-url/')) {
    return { type: 'sourceFile', filePath: emptyModule };
  }
  if (moduleName === 'event-target-shim' || moduleName.startsWith('event-target-shim/')) {
    return { type: 'sourceFile', filePath: eventTargetNative };
  }
  if (moduleName === 'abort-controller' || moduleName.startsWith('abort-controller/')) {
    return { type: 'sourceFile', filePath: abortControllerNative };
  }
  // Rediriger le bundle UMD supabase-js vers notre version patchee
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Transformer custom : remplace installAbortSignalPatch dans le source Supabase
// par une fonction no-op avant que Metro compile le module.
const defaultTransformerPath = config.transformer?.babelTransformerPath ||
  require.resolve('metro-transform-plugins');

config.transformer = config.transformer || {};
config.transformer.babelTransformerPath = require.resolve('./src/metro-transformer.js');

module.exports = config;
