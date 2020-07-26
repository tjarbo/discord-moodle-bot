import { ApiResponse, ApiStatus } from './response.class';

/**
 * Custom ApiSuccess
 * @export
 * @class ApiSuccess
 * @extends {ApiResponse}
 */
export class ApiSuccess extends ApiResponse {

  /**
   * Creates an instance of ApiSuccess with empty error property
   * @param {number} [code] HTTP STATUS CODE
   * @param {object} [data] Response data
   * @memberof ApiSuccess
   */
  constructor(code?: number, data?: object) {
    super(ApiStatus.Success, code || 200, data || {}, null);
  }

}
