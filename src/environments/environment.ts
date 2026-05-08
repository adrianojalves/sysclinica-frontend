/* Production Environment Configuration */
export const environment = {
  production: true,
  /* * Since Angular will be embedded inside the Spring Boot .jar,
   * they share the same host and port. A relative path prevents CORS issues.
   */
  apiUrl: '/api'
};