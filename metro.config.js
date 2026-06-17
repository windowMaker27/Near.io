const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);
const emptyModule = path.resolve(__dirname, 'src/empty-module.js');

// whatwg-url et event-target-shim tentent de redefinir Event.NONE etc.
// via Object.defineProperty sur des props gelees par Hermes + New Arch -> crash.
// abort-controller est intentionnellement conserve : expo/winter/runtime.native
// en a besoin pour installAbortSignalPatch avant que global.AbortSignal soit dispo.
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === 'whatwg-url' ||
    moduleName.startsWith('whatwg-url/') ||
    moduleName === 'event-target-shim' ||
    moduleName.startsWith('event-target-shim/')
  ) {
    return { type: 'sourceFile', filePath: emptyModule };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
