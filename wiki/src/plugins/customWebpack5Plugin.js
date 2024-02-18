const webpack = require('webpack');
// customWebpack5Plugin.js
module.exports = function () {
    return {
      name: 'custom-docusaurus-plugin',
      // eslint-disable-next-line
      configureWebpack(config, isServer, utils) {
        return {
          resolve: {
            alias: {
            },
            fallback: {
              buffer: require.resolve('buffer/'),
              stream: require.resolve("stream-browserify"),
              https: require.resolve("https-browserify"),
              http: require.resolve("stream-http"),
              zlib: require.resolve("browserify-zlib"),
              assert: require.resolve("assert/"),
            },
          },
          plugins: [
            new webpack.ProvidePlugin({
                Buffer: ['buffer', 'Buffer'],
            }),
          ]
        };
      },
    };
  };