/**
 * Validation middleware for Next.js API routes
 * Provides reusable validation functions for request handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { ValidationResult, validateRequestParams, validationSchemas } from './index';

export interface ValidatedRequest<T = any> {
  params: T;
  searchParams: URLSearchParams;
  request: NextRequest;
}

export type ValidationMiddleware<T = any> = (
  request: NextRequest
) => Promise<{ success: false; error: string } | { success: true; data: ValidatedRequest<T> }>;

/**
 * Create validation middleware for API routes
 */
export function createValidationMiddleware<T = any>(
  schema: Record<string, any>
): ValidationMiddleware<T> {
  return async (request: NextRequest) => {
    try {
      // Extract search parameters
      const searchParams = request.nextUrl.searchParams;
      const params: Record<string, any> = {};

      // Convert search params to object for validation
      for (const [key, value] of searchParams.entries()) {
        params[key] = value;
      }

      // Validate parameters
      const validationResult: ValidationResult = validateRequestParams(params, schema);

      if (!validationResult.isValid) {
        return {
          success: false,
          error: validationResult.error!
        };
      }

      return {
        success: true,
        data: {
          params: validationResult.sanitizedValue as T,
          searchParams,
          request
        }
      };
    } catch (error) {
      console.error('Validation middleware error:', error);
      return {
        success: false,
        error: 'Internal validation error'
      };
    }
  };
}

/**
 * Pre-configured validation middlewares for common API patterns
 */
export const validationMiddleware = {
  hadithLookup: createValidationMiddleware(validationSchemas.hadithLookup),
  collectionSearch: createValidationMiddleware(validationSchemas.collectionSearch),
  collectionRange: createValidationMiddleware(validationSchemas.collectionRange),
  narratorsSearch: createValidationMiddleware(validationSchemas.narratorsSearch)
};

/**
 * Handle validation errors in API routes
 */
export function handleValidationError(error: string, status: number = 400): NextResponse {
  return NextResponse.json(
    { success: false, error },
    { status }
  );
}

/**
 * Safe parameter extraction with validation
 */
export function extractValidatedParams<T>(
  request: NextRequest,
  schema: Record<string, any>
): Promise<ValidatedRequest<T> | null> {
  return createValidationMiddleware<T>(schema)(request)
    .then(result => {
      if (result.success) {
        return result.data;
      }
      return null;
    })
    .catch(error => {
      console.error('Parameter extraction error:', error);
      return null;
    });
}