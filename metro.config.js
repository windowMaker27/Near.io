const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);
const emptyModule = path.resolve(__dirname, 'src/empty-module.js');
const abortNative = path.resolve(__dirname, 'src/abort-controller-native.js');

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Ces polyfills tentent de redefinir Event.NONE/BUBBLING_PHASE via
  // Object.defineProperty sur des proprietes gelees par Hermes -> crash.
  if (moduleName === 'whatwg-url' || moduleName.startsWith('whatwg-url/') ||
      moduleName === 'event-target-shim' || moduleName.startsWith('event-target-shim/')) {
    return { type: 'sourceFile', filePath: emptyModule };
  }
  // abort-controller : ne pas stubber completement, retourner les natifs Hermes
  // pour que Supabase (installAbortSignalPatch) trouve AbortSignal.timeout
  if (moduleName === 'abort-controller' || moduleName.startsWith('abort-controller/')) {
    return { type: 'sourceFile', filePath: abortNative };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
