const webpack = require('webpack');
const path = require('node:path');
// customWebpack5Plugin.js
module.exports = function () {
    return {
      name: 'custom-docusaurus-plugin',
      // eslint-disable-next-line
      configureWebpack(config, isServer, utils) {
        let rendererReplacements = 0;
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
            ...(isServer ? [new webpack.NormalModuleReplacementPlugin(
              /^\.\/renderToHtml$/,
              (resource) => {
                const clientDir = path.dirname(require.resolve('@docusaurus/core/lib/client/renderToHtml'));
                if (resource.context === clientDir) {
                  resource.request = require.resolve('../ssg/renderToHtml');
                  rendererReplacements++;
                }
              },
            ), {
              apply(compiler) {
                compiler.hooks.beforeCompile.tap('SsgRendererContract', () => {
                  rendererReplacements = 0;
                });
                compiler.hooks.afterCompile.tap('SsgRendererContract', () => {
                  if (rendererReplacements !== 1) {
                    throw new Error(`Expected one Docusaurus SSR renderer replacement, got ${rendererReplacements}`);
                  }
                });
              },
            }] : []),
            new webpack.ProvidePlugin({
                Buffer: ['buffer', 'Buffer'],
            }),
            ...(isServer ? [] : [new webpack.ProvidePlugin({
                // readable-stream (via bitcoinjs-message) reads the `process` global,
                // which webpack 5 no longer polyfills for browser bundles.
                process: require.resolve('process/browser.js'),
            })]),
          ]
        };
      },
    };
  };