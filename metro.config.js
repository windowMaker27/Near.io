const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);
const emptyModule = path.resolve(__dirname, 'src/empty-module.js');

// extraNodeModules ne capture pas les imports transitifs profonds.
// resolveRequest intercepte TOUS les imports de whatwg-url peu importe la profondeur.
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'whatwg-url' || moduleName.startsWith('whatwg-url/')) {
    return { type: 'sourceFile', filePath: emptyModule };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
