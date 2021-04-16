import { ValidationErrorItem } from '@hapi/joi';
import { HttpError } from 'http-errors';

export enum ApiStatus {
  Success = 'success',
  Error = 'error'
}

type HTTPStatusCode = number;

/**
 * Custom ApiResponse
 *
 * @export
 * @class ApiResponse
 */
export class ApiResponse {

  /**
   * Defines type of the ApiResponse instance
   *
   * @type {ApiStatus}
   * @memberof ApiResponse
   */
  status: ApiStatus;

  /**
   * Matches the current Http status code of the ApiResponse
   *
   * @type {HTTPStatusCode}
   * @memberof ApiResponse
   */
  code: HTTPStatusCode;

  /**
   * Contains an object to provide data of a successful request
   *
   * @type {{ [key: string]: any }}
   * @memberof ApiResponse
   */
  data: { [key: string]: any };

  /**
   * Array of possible errors that occurred during request processing
   *
   * @type {((HttpError | ValidationErrorItem)[])}
   * @memberof ApiResponse
   */
  error: (HttpError | ValidationErrorItem)[];

  /**
   * Creates an instance of ApiResponse.
   *
   * @param {ApiStatus} status type of ApiResponse
   * @param {number} code HTTP STATUS CODE
   * @param {object} data Response data
   * @param {((HttpError | ValidationErrorItem)[])} error Array of errors
   * @memberof ApiResponse
   */
  constructor(status: ApiStatus, code: HTTPStatusCode, data: object, error: (HttpError | ValidationErrorItem)[]) {
    this.status = status;
    this.code = code;
    this.data = data || {};
    this.error = error || [];
  }
}