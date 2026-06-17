const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const emptyModule          = path.resolve(__dirname, 'src/empty-module.js');
const eventTargetNative    = path.resolve(__dirname, 'src/event-target-shim-native.js');
const abortControllerNative = path.resolve(__dirname, 'src/abort-controller-native.js');
const wsEventTargetNative  = path.resolve(__dirname, 'src/ws-event-target-native.js');

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // whatwg-url -> module vide
  if (moduleName === 'whatwg-url' || moduleName.startsWith('whatwg-url/')) {
    return { type: 'sourceFile', filePath: emptyModule };
  }
  // event-target-shim -> globals Hermes
  if (moduleName === 'event-target-shim' || moduleName.startsWith('event-target-shim/')) {
    return { type: 'sourceFile', filePath: eventTargetNative };
  }
  // abort-controller -> globals Hermes
  if (moduleName === 'abort-controller' || moduleName.startsWith('abort-controller/')) {
    return { type: 'sourceFile', filePath: abortControllerNative };
  }
  // ws/lib/event-target -> shim sans assignation des constantes read-only
  if (moduleName === 'ws/lib/event-target' || moduleName.endsWith('/ws/lib/event-target.js')) {
    return { type: 'sourceFile', filePath: wsEventTargetNative };
  }

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
