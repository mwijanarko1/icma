/**
 * Robust fetch utilities with comprehensive error handling
 */

export interface FetchError extends Error {
  status?: number;
  statusText?: string;
  url?: string;
  response?: any;
}

export interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

/**
 * Custom error class for fetch operations
 */
export class FetchError extends Error {
  status?: number;
  statusText?: string;
  url?: string;
  response?: any;

  constructor(message: string, status?: number, statusText?: string, url?: string, response?: any) {
    super(message);
    this.name = 'FetchError';
    this.status = status;
    this.statusText = statusText;
    this.url = url;
    this.response = response;
  }
}

/**
 * Enhanced fetch with timeout, retries, and comprehensive error handling
 */
export async function robustFetch(url: string, options: FetchOptions = {}): Promise<Response> {
  const {
    timeout = 30000, // 30 seconds default
    retries = 2,
    retryDelay = 1000, // 1 second delay between retries
    ...fetchOptions
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Check if response is ok
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let responseData;

        try {
          // Try to parse error response as JSON
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
            if (responseData.error) {
              errorMessage = responseData.error;
            }
          } else {
            // Try to get text response
            responseData = await response.text();
            if (responseData) {
              errorMessage += ` - ${responseData}`;
            }
          }
        } catch (parseError) {
          // If we can't parse the response, use the status text
          console.warn('Could not parse error response:', parseError);
        }

        throw new FetchError(errorMessage, response.status, response.statusText, url, responseData);
      }

      return response;
    } catch (error) {
      lastError = error as Error;

      // Don't retry on certain errors
      if (error instanceof FetchError && error.status) {
        // Don't retry on client errors (4xx) except 408, 429
        if (error.status >= 400 && error.status < 500 && error.status !== 408 && error.status !== 429) {
          throw error;
        }
      }

      // Don't retry on AbortError (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new FetchError(`Request timeout after ${timeout}ms`, undefined, undefined, url);
      }

      // If this was the last attempt, throw the error
      if (attempt === retries) {
        if (error instanceof FetchError) {
          throw error;
        } else {
          throw new FetchError(
            `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            undefined,
            undefined,
            url
          );
        }
      }

      // Wait before retrying
      if (retryDelay > 0 && attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  // This should never be reached, but just in case
  throw lastError!;
}

/**
 * Parse JSON response with error handling
 */
export async function parseJsonResponse<T = any>(response: Response): Promise<T> {
  try {
    const data = await response.json();
    return data;
  } catch (error) {
    throw new FetchError(
      `Failed to parse JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`,
      response.status,
      response.statusText,
      response.url
    );
  }
}

/**
 * Make an API call with comprehensive error handling
 */
export async function apiCall<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  try {
    const response = await robustFetch(url, options);
    return await parseJsonResponse<T>(response);
  } catch (error) {
    if (error instanceof FetchError) {
      throw error;
    }
    throw new FetchError(
      `API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      undefined,
      url
    );
  }
}

/**
 * Check if an error is a network error (should be retried)
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof FetchError) {
    // Network errors don't have a status code or have specific status codes
    return !error.status || error.status >= 500 || error.status === 408 || error.status === 429;
  }
  return error instanceof Error && (error.name === 'TypeError' || error.message.includes('fetch'));
}

/**
 * Check if an error is a client error (should not be retried)
 */
export function isClientError(error: unknown): boolean {
  return error instanceof FetchError && typeof error.status === 'number' && error.status >= 400 && error.status < 500;
}