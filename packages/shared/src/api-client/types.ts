/**
 * API Client types for @jsoft/shared
 */

/** HTTP methods supported by the client */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** Configuration options for creating an API client */
export interface ApiClientConfig {
  /** Base URL for all API requests (e.g., 'http://localhost:3000/api') */
  baseUrl: string;
  /** Optional callback invoked on 401 Unauthorized responses */
  onUnauthorized?: () => void;
  /** Optional function that returns the current JWT token */
  getToken?: () => string | null;
}

/** Options for individual requests */
export interface RequestOptions {
  /** Additional headers to include */
  headers?: Record<string, string>;
  /** Query parameters */
  params?: Record<string, string | number | boolean>;
  /** Skip adding Authorization header for this request */
  skipAuth?: boolean;
}

/** Standard API error structure */
export interface ApiClientError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, string[]>;
}

/** Response wrapper for typed responses */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}
