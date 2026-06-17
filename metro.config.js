const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const config = getDefaultConfig(__dirname);

const emptyModule           = path.resolve(__dirname, 'src/empty-module.js');
const eventTargetNative     = path.resolve(__dirname, 'src/event-target-shim-native.js');
const abortControllerNative = path.resolve(__dirname, 'src/abort-controller-native.js');
const wsEventTargetNative   = path.resolve(__dirname, 'src/ws-event-target-native.js');

// Chemin absolu vers ws/lib/event-target.js dans node_modules
let wsEventTargetPath;
try {
  wsEventTargetPath = require.resolve('ws/lib/event-target');
} catch (e) {
  wsEventTargetPath = null;
}

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // whatwg-url -> vide
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
  // ws/lib/event-target via chemin absolu (pour capter les imports relatifs './event-target')
  if (wsEventTargetPath) {
    // Resoudre d'abord pour obtenir le chemin absolu
    let resolved;
    try {
      resolved = originalResolveRequest
        ? originalResolveRequest(context, moduleName, platform)
        : context.resolveRequest(context, moduleName, platform);
    } catch (e) {
      resolved = null;
    }
    if (
      resolved &&
      resolved.type === 'sourceFile' &&
      resolved.filePath === wsEventTargetPath
    ) {
      return { type: 'sourceFile', filePath: wsEventTargetNative };
    }
    if (resolved) return resolved;
  }

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
