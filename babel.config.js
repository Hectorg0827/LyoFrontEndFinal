module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
          blacklist: null,
          whitelist: null,
          safe: false,
          allowUndefined: true,
        },
      ],
      ["module-resolver", {
        root: ["."],
        alias: {
          "@components": "./src/components",
          "@screens": "./src/screens",
          "@services": "./src/services",
          "@store": "./src/store",
          "@navigation": "./src/navigation",
          "@utils": "./src/utils",
          "@types": "./src/types",
          "@config": "./src/config"
        },
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }],
      "nativewind/babel",
      "react-native-reanimated/plugin",
    ],
  };
};
