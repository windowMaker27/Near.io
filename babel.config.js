// babel.config.js — CommonJS requis (pas d'ESM)
// Les plugins class-properties/private-methods sont nécessaires pour Hermes
// qui ne supporte pas nativement la syntaxe #privateField ES2022 en mode dev bundle
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // DOIT être en dernier — contrainte reanimated
      'react-native-reanimated/plugin',
    ],
    overrides: [
      {
        // Transpile les champs privés uniquement dans les modules node_modules
        // qui en ont besoin (react-native, reanimated, undici, etc.)
        include: [
          /node_modules\/react-native\/src\/private/,
          /node_modules\/react-native\/Libraries/,
          /node_modules\/react-native-reanimated/,
        ],
        plugins: [
          ['@babel/plugin-transform-class-properties', { loose: true }],
          ['@babel/plugin-transform-private-methods', { loose: true }],
          ['@babel/plugin-transform-private-property-in-object', { loose: true }],
        ],
      },
    ],
  };
};
