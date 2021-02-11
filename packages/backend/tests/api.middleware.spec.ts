/* ts-lint:prefer-const: off */

import { apiMiddleware } from '../src/utils/api/index';
import { Request, Response } from 'express';
import { UnauthorizedError, ErrorCode } from 'express-jwt';
import { ApiError } from "../src/utils/api";

jest.mock('../src/configuration/environment.ts');

describe('middleware.ts apiMiddleware', () => {
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

    mockNext = jest.fn();
  });

  it('should handle UnauthorizedError', () => {
    const unauthorizedError = new UnauthorizedError('invalid_token' as ErrorCode, {message: 'test'});

    apiMiddleware(unauthorizedError, mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenLastCalledWith(401);
    expect(mockResponse.json).toHaveBeenLastCalledWith(new ApiError(401, unauthorizedError.message));
  });

  it('should handle ApiError', () => {
    const apiError = new ApiError(404, 'User not found');

    apiMiddleware(apiError, mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenLastCalledWith(404);
    expect(mockResponse.json).toHaveBeenLastCalledWith(apiError);
  });

  it.skip('should pass object to next optional middleware', () => {
    const apiError = new ApiError(404, 'User not found');
    apiMiddleware(apiError, mockRequest, mockResponse, mockNext);
    
    expect(mockNext.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls[0][0]).toBe(apiError);
  });
});
