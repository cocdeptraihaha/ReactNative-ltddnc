const { getDefaultConfig } = require("expo/metro-config");

// Minimal config - avoid NativeWind withNativeWind (causes ERR_UNSUPPORTED_ESM_URL_SCHEME on Windows)
const config = getDefaultConfig(__dirname);
module.exports = config;
