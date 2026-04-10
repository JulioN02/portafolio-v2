/**
 * API Client - fetch-based HTTP client with JWT support
 *
 * Uses native fetch (no external dependencies).
 * Automatically attaches JWT Authorization headers.
 * Handles 401 via configurable logout callback.
 */

import type {
  ApiClientConfig,
  ApiClientError,
  RequestOptions,
} from './types.js';

export function createApiClient(config: ApiClientConfig) {
  const { baseUrl, onUnauthorized, getToken } = config;

  /**
   * Builds a full URL with optional query parameters
   */
  function buildUrl(
    path: string,
    params?: Record<string, string | number | boolean>,
  ): string {
    const url = new URL(path, baseUrl);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }

  /**
   * Builds request headers with optional Authorization
   */
  function buildHeaders(
    customHeaders?: Record<string, string>,
    skipAuth?: boolean,
  ): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (!skipAuth && getToken) {
      const token = getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Core request handler with error management
   */
  async function request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    const url = buildUrl(path, options?.params);
    const headers = buildHeaders(options?.headers, options?.skipAuth);

    const init: RequestInit = {
      method,
      headers,
    };

    if (body !== undefined && method !== 'GET') {
      init.body = JSON.stringify(body);
    }

    const response = await fetch(url, init);

    if (!response.ok) {
      // Handle 401 Unauthorized
      if (response.status === 401) {
        if (onUnauthorized) {
          onUnauthorized();
        }
        const error: ApiClientError = {
          message: 'Unauthorized - please log in again',
          status: 401,
          code: 'UNAUTHORIZED',
        };
        throw error;
      }

      // Parse error body
      let errorBody: ApiClientError;
      try {
        const parsed = await response.json();
        errorBody = {
          message: parsed.message ?? response.statusText,
          status: response.status,
          code: parsed.code,
          details: parsed.details,
        };
      } catch {
        errorBody = {
          message: response.statusText,
          status: response.status,
        };
      }

      throw errorBody;
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  return {
    /** GET request */
    get<T>(path: string, options?: RequestOptions): Promise<T> {
      return request<T>('GET', path, undefined, options);
    },

    /** POST request */
    post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
      return request<T>('POST', path, body, options);
    },

    /** PUT request */
    put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
      return request<T>('PUT', path, body, options);
    },

    /** PATCH request */
    patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
      return request<T>('PATCH', path, body, options);
    },

    /** DELETE request */
    delete<T>(path: string, options?: RequestOptions): Promise<T> {
      return request<T>('DELETE', path, undefined, options);
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
