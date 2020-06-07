/**
 * Custom class for centralized api error management
 *
 * @export
 * @class ErrorHandler
 * @extends {Error}
 */
export class ApiError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}
