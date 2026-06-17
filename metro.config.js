const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);
const emptyModule = path.resolve(__dirname, 'src/empty-module.js');
const eventTargetNative = path.resolve(__dirname, 'src/event-target-shim-native.js');

// whatwg-url tente de redefiner Event.NONE etc. via Object.defineProperty
// sur des props gelees par Hermes + New Arch -> crash. Stub vide suffisant.
//
// event-target-shim : abort-controller en a besoin pour new EventTarget/Event.
// On ne peut pas le stubber a vide - on retourne les classes natives Hermes.
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'whatwg-url' || moduleName.startsWith('whatwg-url/')) {
    return { type: 'sourceFile', filePath: emptyModule };
  }
  if (moduleName === 'event-target-shim' || moduleName.startsWith('event-target-shim/')) {
    return { type: 'sourceFile', filePath: eventTargetNative };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
