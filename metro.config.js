const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// whatwg-url (depandance transitive de @supabase/supabase-js via undici)
// tente de reedefinir Event.NONE etc. en read-only sur Hermes + New Arch → crash.
// RN 0.85 expose nativement URL/URLSearchParams, donc on remplace par un stub vide.
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'whatwg-url': path.resolve(__dirname, 'src/empty-module.js'),
};

module.exports = config;
