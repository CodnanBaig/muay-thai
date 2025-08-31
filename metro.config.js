const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable watchman to avoid socket issues
config.resolver.useWatchman = false;

module.exports = config;