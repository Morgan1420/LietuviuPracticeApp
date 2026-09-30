module.exports = {
  preset: '@react-native/jest-preset',
  // Merged with the preset's transforms: treat bundled audio like other assets.
  transform: {
    '^.+\\.mp3$': require.resolve('@react-native/jest-preset/jest/assetFileTransformer.js'),
  },
  // React Navigation and Expo ship untranspiled ESM, so let Babel transform them.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|expo(-.*)?|@expo(-.*)?)/)',
  ],
};
