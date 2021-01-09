const path = require('path');
const {
  getBabelLoader,
} = require('customize-cra');

module.exports = {
  webpack: function(config, env) {
    config.output.library = env.LIBRARY_NAME;
    config.output.libraryTarget = 'umd';

    const babelLoader = getBabelLoader(config);
    babelLoader.options.presets = babelLoader.options.presets || [];
    babelLoader.options.presets.push(
      [
        '@babel/preset-env',
        {
          useBuiltIns: 'usage',
          corejs: 3,
          targets: {
            ie: 10,
          },
          modules: 'umd',
        },
      ],
    );

    const babelLoaderOthers = getBabelLoader(config, true);
    babelLoaderOthers.options.plugins = babelLoaderOthers.options.plugins || [];
    babelLoaderOthers.options.plugins.push(
      '@babel/plugin-transform-object-set-prototype-of-to-assign',
    );

    return config;
  },
  jest: function(config) {

    return config;
  },
  devServer: function(configFunction) {
    return function(proxy, allowedHost) {
      const config = configFunction(proxy, allowedHost);
      config.disableHostCheck = true;
      config.headers = config.headers || {};
      config.headers = {
        ...config.headers,
        'Access-Control-Allow-Origin': '*',
      };
      // 当使用 HTML History 接口作为页面路由时，对于404的url响应全部使其跳转到index.html
      config.historyApiFallback = true;

      return config;
    };
  },
  paths: function(paths, env) {

    return paths;
  },
};