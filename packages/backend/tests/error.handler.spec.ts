import { apiErrorHandler } from '../src/controllers/error/handler';
import { Request, Response } from 'express';
import { UnauthorizedError, ErrorCode } from 'express-jwt';
import { ApiError } from '../src/controllers/error/api.class';

describe('handler.ts apiErrorHandler', () => {
  let mockRequest: Request;
  let mockResponse: Response;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockResponse = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
      send: jest.fn(),
      end: jest.fn()
    } as any as Response;

  });

  it('should handle UnauthorizedError', () => {
    const unauthorizedError = new UnauthorizedError('invalid_token' as ErrorCode, {message: "test"})

    apiErrorHandler(unauthorizedError, mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenLastCalledWith(401);
    expect(mockResponse.json).toHaveBeenLastCalledWith({
      status: 'error',
      statusCode: 401,
      message: 'Invalid token'
    });
  });

  it('should handle ApiError', () => {
    const apiError = new ApiError(404, 'User not found')

    apiErrorHandler(apiError, mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenLastCalledWith(404);
    expect(mockResponse.json).toHaveBeenLastCalledWith({
      status: 'error',
      statusCode: 404,
      message: 'User not found'
    });
  });
});