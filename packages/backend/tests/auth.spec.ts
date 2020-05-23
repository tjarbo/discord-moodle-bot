import { getTokenFromHeader, authLogin, authRequestToken } from '../src/controllers/authentication/auth';
import { User } from '../src/controllers/user/user.schema';
import { Request, Response } from 'express';
import mockingoose from 'mockingoose';
import { loggerFile } from '../src/configuration/logger';
import { ApiError } from '../src/controllers/error/api.class';

// mock relevant imports
jest.mock('../src/configuration/discord.ts', () => null)

describe('auth.ts getTokenFromHeader', () => {
  it('should return the correct jwt', () => {
    let mockRequest = {
      headers: {},
      body: {},
    } as Request;

    expect(getTokenFromHeader(mockRequest)).toBe(null)
    mockRequest.headers.authorization = 'Bearer RANDOMJETTOKEN123123'
    expect(getTokenFromHeader(mockRequest)).toBe('RANDOMJETTOKEN123123')
  });
});

describe('auth.js authRequestToken', () => {
  let mockRequest: Request;
  let mockResponse: Response;
  let mockUser: any;
  let mockNext: jest.Mock;
  let spyLogger: jest.SpyInstance;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      body: {},
    } as Request;

    mockResponse = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
      send: jest.fn(),
      end: jest.fn()
    } as any as Response;

    mockUser = {
      userName: 'testuser#1234',
      userId: '123456789',
      createdAt: Date.now(),
    }

    mockNext = jest.fn();
    spyLogger = jest.spyOn(loggerFile, 'error')
  })

  afterEach(() => {
    jest.clearAllMocks();
 })

  it('should log error if wrong tokenRequest is provided', () => {

    // no body
    authRequestToken(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls[0][0]).toEqual(new ApiError(400 , "\"username\" is required"));

    // number as username (userid instead of username)
    mockRequest.body.username = 12312312312312;

    authRequestToken(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(2);
    expect(mockNext.mock.calls.length).toBe(2);
    expect(mockNext.mock.calls[1][0]).toEqual(new ApiError(400 , "\"username\" must be a string"));
  });

  it('should log error if unkown user is provided', () => {
    mockRequest.body.username = "testuser2#123123";
    mockingoose(User).toReturn(null, 'findOne');
    
    authRequestToken(mockRequest, mockResponse, mockNext);

    expect(mockNext.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls[0][0]).toBe(new ApiError(404 ,`Nutzer ${mockRequest.body.username} nicht gefunden`));
    expect(spyLogger.mock.calls.length).toBe(1);
  });
})