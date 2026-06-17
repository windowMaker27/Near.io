const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const emptyModule           = path.resolve(__dirname, 'src/empty-module.js');
const eventTargetNative     = path.resolve(__dirname, 'src/event-target-shim-native.js');
const abortControllerNative = path.resolve(__dirname, 'src/abort-controller-native.js');
const wsEventTargetNative   = path.resolve(__dirname, 'src/ws-event-target-native.js');
const rnEventNative         = path.resolve(__dirname, 'src/rn-event-native.js');

// Chemin absolu exact du fichier RN qui crash
const RN_EVENT_PATH = path.resolve(
  __dirname,
  'node_modules/react-native/src/private/webapis/dom/events/Event.js'
);

// Chemin absolu de ws/lib/event-target (pour capter les imports relatifs)
let wsEventTargetPath = null;
try { wsEventTargetPath = require.resolve('ws/lib/event-target'); } catch (_) {}

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

  // Resoudre d'abord pour obtenir le chemin absolu
  let resolved = null;
  try {
    resolved = originalResolveRequest
      ? originalResolveRequest(context, moduleName, platform)
      : context.resolveRequest(context, moduleName, platform);
  } catch (e) {
    // laisser remonter l'erreur originale si aucun alias ne correspond
    throw e;
  }

  if (resolved && resolved.type === 'sourceFile') {
    // react-native Event.js New Arch -> shim sans assignation
    if (resolved.filePath === RN_EVENT_PATH) {
      return { type: 'sourceFile', filePath: rnEventNative };
    }
    // ws/lib/event-target -> shim sans assignation
    if (wsEventTargetPath && resolved.filePath === wsEventTargetPath) {
      return { type: 'sourceFile', filePath: wsEventTargetNative };
    }
  }

  return resolved;
};

module.exports = config;
