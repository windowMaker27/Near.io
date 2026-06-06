// babel.config.js — must be CommonJS (no ESM), reanimated plugin goes here NOT in app.json
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
    ],
  };
};
