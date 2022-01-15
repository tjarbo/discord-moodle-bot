import { ApiResponse, ApiStatus } from './response.class';
import { ValidationErrorItem } from 'joi';
import createHttpError from 'http-errors';


/**
 * Custom ApiError
 * @export
 * @class ApiError
 * @extends {ApiResponse}
 */
export class ApiError extends ApiResponse {

  /**
   * Creates an instance of ApiError with empty data property.
   * @param {number} code HTTP STATUS CODE
   * @param {(ValidationErrorItem[] | string)} error Array of ValidationErrorItem or string to create a new array
   * @memberof ApiError
   */
  constructor(code: number, error: ValidationErrorItem[] | string) {
    if (typeof error === 'string') {
      super(ApiStatus.Error, code, null, [ createHttpError(error) ]);
    } else {
      super(ApiStatus.Error, code, null, error );
    }
  }
}
