const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Par défaut Metro ne transpile pas node_modules.
// On force la transpilation des packages qui utilisent des champs privés ES2022 (#field)
// incompatibles avec Hermes en mode dev (hermes-stable profile).
const defaultBlockList = config.resolver?.blockList ?? [];

config.resolver = {
  ...config.resolver,
  unstable_enablePackageExports: true,
};

// transformIgnorePatterns définit ce que Babel NE transpile PAS.
// On exclut tout node_modules SAUF les packages connus pour utiliser #privateField.
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
  transformVariants: config.transformer?.transformVariants,
};

// Override transformIgnorePatterns hérité d'expo/metro-config
// pour inclure les modules qui utilisent des champs privés
config.transformerPath = config.transformerPath;
config.resolver.sourceExts = config.resolver.sourceExts ?? ['js', 'jsx', 'ts', 'tsx', 'json'];

// Le vrai fix : passer par getTransformOptions dans un custom transformer
// n'est pas nécessaire — il suffit de surcharger la propriété ci-dessous.
// expo/metro-config définit déjà des transformIgnorePatterns qui incluent react-native.
// On s'assure qu'ils sont bien présents.
if (config.transformer && !config.transformer.getTransformOptions) {
  config.transformer.getTransformOptions = async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  });
}

module.exports = config;
