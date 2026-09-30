module.exports = {
  preset: '@react-native/jest-preset',
  // React Navigation and Expo ship untranspiled ESM, so let Babel transform them.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|expo(-.*)?|@expo(-.*)?)/)',
  ],
};
