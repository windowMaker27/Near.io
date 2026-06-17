// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Force Metro à transpiler les modules qui utilisent des champs privés ES2022 (#field)
// react-native 0.81+ et react-native-reanimated 3.x utilisent cette syntaxe
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

// Par défaut expo/metro-config exclut node_modules de la transpilation Babel.
// On les ré-inclut sélectivement pour les libs qui utilisent #privateField.
config.resolver = {
  ...config.resolver,
  unstable_enablePackageExports: true,
};

module.exports = config;
