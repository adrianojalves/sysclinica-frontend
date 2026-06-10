export interface PageMetadata {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

/**
 * Generic interface representing a paginated response from Spring Boot.
 * The pagination metadata is nested under the "page" property.
 */
export interface Page<T> {
  content: T[];
  page: PageMetadata;
}
