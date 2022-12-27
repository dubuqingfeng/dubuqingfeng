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