const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/supplier',
    createProxyMiddleware({
      target: 'http://local.ms-gzc.m2.com.cn',
      changeOrigin: true,
    }),
  );
};