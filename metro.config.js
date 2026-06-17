const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);
const emptyModule = path.resolve(__dirname, 'src/empty-module.js');

// Sur RN 0.85 + New Architecture + Hermes, les APIs Web suivantes sont natives :
// - URL, URLSearchParams → natif Hermes
// - AbortController, AbortSignal → natif Hermes
// - Event, EventTarget → natif RN (react-native/src/private/webapis/dom/events)
//
// Les polyfills suivants tentent de redefinir Event.NONE/BUBBLING_PHASE
// via Object.defineProperty sur des proprietes deja gelees → crash.
// On les remplace par des stubs vides.
const BLOCKED_MODULES = [
  'whatwg-url',
  'event-target-shim',
  'abort-controller',
];

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const blocked = BLOCKED_MODULES.some(
    (m) => moduleName === m || moduleName.startsWith(m + '/')
  );
  if (blocked) {
    return { type: 'sourceFile', filePath: emptyModule };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
