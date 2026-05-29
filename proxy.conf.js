module.exports = {
  '/api': {
    target: 'http://localhost:8080',
    secure: false,
    changeOrigin: true,
    // 'configure' é o callback nativo do Vite (http-proxy).
    // 'onProxyReq' é http-proxy-middleware e não funciona no Angular 19.
    configure: function (proxy) {
      proxy.on('proxyReq', function (proxyReq) {
        proxyReq.removeHeader('origin');
        proxyReq.removeHeader('referer');
      });
    }
  }
};
