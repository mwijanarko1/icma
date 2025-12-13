/**
 * Input validation utilities for ICMA API routes
 * Provides comprehensive validation for API parameters, search queries, and data sanitization
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedValue?: any;
}

export interface NumericValidationOptions {
  min?: number;
  max?: number;
  integer?: boolean;
  allowZero?: boolean;
}

export interface StringValidationOptions {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  allowEmpty?: boolean;
  trim?: boolean;
}

/**
 * Validate numeric input parameters
 */
export function validateNumeric(
  value: any,
  fieldName: string,
  options: NumericValidationOptions = {}
): ValidationResult {
  const { min, max, integer = false, allowZero = true } = options;

  // Check if value is provided and is a number
  if (value === undefined || value === null || value === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const num = Number(value);
  if (isNaN(num)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }

  // Check integer requirement
  if (integer && !Number.isInteger(num)) {
    return { isValid: false, error: `${fieldName} must be an integer` };
  }

  // Check zero allowance
  if (!allowZero && num === 0) {
    return { isValid: false, error: `${fieldName} cannot be zero` };
  }

  // Check minimum value
  if (min !== undefined && num < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min}` };
  }

  // Check maximum value
  if (max !== undefined && num > max) {
    return { isValid: false, error: `${fieldName} cannot exceed ${max}` };
  }

  return { isValid: true, sanitizedValue: num };
}

/**
 * Validate string input parameters
 */
export function validateString(
  value: any,
  fieldName: string,
  options: StringValidationOptions = {}
): ValidationResult {
  const {
    minLength,
    maxLength,
    pattern,
    allowEmpty = false,
    trim = true
  } = options;

  // Check if value is provided
  if (value === undefined || value === null) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  let str = String(value);

  // Trim whitespace if requested
  if (trim) {
    str = str.trim();
  }

  // Check empty string allowance
  if (!allowEmpty && str.length === 0) {
    return { isValid: false, error: `${fieldName} cannot be empty` };
  }

  // Check minimum length
  if (minLength !== undefined && str.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters long` };
  }

  // Check maximum length
  if (maxLength !== undefined && str.length > maxLength) {
    return { isValid: false, error: `${fieldName} cannot exceed ${maxLength} characters` };
  }

  // Check pattern
  if (pattern && !pattern.test(str)) {
    return { isValid: false, error: `${fieldName} format is invalid` };
  }

  return { isValid: true, sanitizedValue: str };
}

/**
 * Validate hadith collection names
 */
export function validateHadithCollection(collection: any): ValidationResult {
  const validCollections = [
    'bukhari', 'muslim', 'nasai', 'tirmidhi', 'abudawud', 'ibnmajah'
  ];

  const result = validateString(collection, 'collection', {
    minLength: 1,
    maxLength: 20,
    pattern: /^[a-z]+$/
  });

  if (!result.isValid) {
    return result;
  }

  const normalizedCollection = result.sanitizedValue.toLowerCase();

  // Check if collection is valid
  if (!validCollections.includes(normalizedCollection)) {
    return {
      isValid: false,
      error: `Invalid collection: ${collection}. Valid collections: ${validCollections.join(', ')}`
    };
  }

  return { isValid: true, sanitizedValue: normalizedCollection };
}

/**
 * Sanitize FTS5 search queries to prevent injection
 */
export function sanitizeFTSQuery(query: string): string {
  if (!query || typeof query !== 'string') {
    return '';
  }

  // Remove or escape FTS5 special characters that could be used for injection
  // FTS5 special characters: " ' * ^
  let sanitized = query
    .replace(/"/g, '""')  // Escape double quotes
    .replace(/'/g, "''")  // Escape single quotes
    .replace(/\*/g, '')   // Remove asterisks
    .replace(/\^/g, '');  // Remove carets

  // Limit query length to prevent abuse
  if (sanitized.length > 1000) {
    sanitized = sanitized.substring(0, 1000);
  }

  return sanitized.trim();
}

/**
 * Validate search query parameters
 */
export function validateSearchQuery(query: any, fieldName: string = 'query'): ValidationResult {
  const result = validateString(query, fieldName, {
    minLength: 1,
    maxLength: 1000,
    allowEmpty: false,
    trim: true
  });

  if (!result.isValid) {
    return result;
  }

  // Additional sanitization for search queries
  const sanitized = sanitizeFTSQuery(result.sanitizedValue);

  if (sanitized.length === 0) {
    return { isValid: false, error: `${fieldName} contains no valid search terms` };
  }

  return { isValid: true, sanitizedValue: sanitized };
}

/**
 * Validate pagination parameters
 */
export function validatePagination(limit?: any, offset?: any): ValidationResult {
  const limitResult = limit !== undefined
    ? validateNumeric(limit, 'limit', { min: 1, max: 1000, integer: true })
    : { isValid: true, sanitizedValue: 50 };

  if (!limitResult.isValid) {
    return limitResult;
  }

  const offsetResult = offset !== undefined
    ? validateNumeric(offset, 'offset', { min: 0, integer: true })
    : { isValid: true, sanitizedValue: 0 };

  if (!offsetResult.isValid) {
    return offsetResult;
  }

  return {
    isValid: true,
    sanitizedValue: {
      limit: limitResult.sanitizedValue,
      offset: offsetResult.sanitizedValue
    }
  };
}

/**
 * Validate hadith number with optional sub-version
 */
export function validateHadithNumber(hadithNumber: any, fieldName: string = 'hadith'): ValidationResult {
  const result = validateString(hadithNumber, fieldName, {
    minLength: 1,
    maxLength: 20,
    pattern: /^\d+[a-z]?$/
  });

  if (!result.isValid) {
    return result;
  }

  const match = result.sanitizedValue.match(/^(\d+)([a-z])?$/);
  if (!match) {
    return { isValid: false, error: `${fieldName} must be a number optionally followed by a letter (e.g., 1, 8a)` };
  }

  const baseNumber = parseInt(match[1], 10);
  const subVersion = match[2];

  if (baseNumber < 1) {
    return { isValid: false, error: `${fieldName} number must be positive` };
  }

  return {
    isValid: true,
    sanitizedValue: {
      hadithNumber: baseNumber,
      subVersion: subVersion || null
    }
  };
}

/**
 * Validate API request parameters with comprehensive error handling
 */
export function validateRequestParams(params: Record<string, any>, schema: Record<string, any>): ValidationResult {
  const errors: string[] = [];
  const sanitizedParams: Record<string, any> = {};

  for (const [fieldName, validator] of Object.entries(schema)) {
    const value = params[fieldName];
    const result = validator(value, fieldName);

    if (!result.isValid) {
      errors.push(result.error!);
    } else if (result.sanitizedValue !== undefined) {
      sanitizedParams[fieldName] = result.sanitizedValue;
    }
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      error: errors.join('; ')
    };
  }

  return {
    isValid: true,
    sanitizedValue: sanitizedParams
  };
}

/**
 * Create validation schema for common API patterns
 */
export const validationSchemas = {
  hadithLookup: {
    collection: validateHadithCollection,
    hadith: validateHadithNumber
  },

  collectionSearch: {
    collection: validateHadithCollection,
    search: validateSearchQuery
  },

  collectionRange: {
    collection: validateHadithCollection,
    start: (value: any) => validateNumeric(value, 'start', { min: 1, integer: true }),
    end: (value: any) => validateNumeric(value, 'end', { min: 1, integer: true })
  },

  narratorsSearch: {
    query: (value: any) => validateString(value, 'query', { minLength: 2, maxLength: 100 }),
    limit: (value: any) => validateNumeric(value, 'limit', { min: 1, max: 100, integer: true }),
    offset: (value: any) => validateNumeric(value, 'offset', { min: 0, integer: true })
  },

  collectionOnly: {
    collection: validateHadithCollection
  }
};