/* Development Environment Configuration */
export const environment = {
  production: false,
  // Relative path: the browser calls /api/* on the same host:port (4200).
  // ng serve proxies those requests to localhost:8080 via proxy.conf.json.
  apiUrl: '/api'
};