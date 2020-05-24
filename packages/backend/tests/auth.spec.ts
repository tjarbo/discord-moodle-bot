// mock relevant imports
import { getTokenFromHeader, authLoginRequest, authTokenRequest } from '../src/controllers/authentication/auth';
import { User } from '../src/controllers/user/user.schema';
import { Request, Response } from 'express';
import mockingoose from 'mockingoose';
import { loggerFile } from '../src/configuration/logger';
import { ApiError } from '../src/controllers/error/api.class';
import { AuthToken } from '../src/controllers/authentication/token.schema';
import { client } from '../src/configuration/discord';

describe('auth.ts getTokenFromHeader', () => {
  it('should return the correct jwt', () => {
    let mockRequest = {
      headers: {},
      body: {},
    } as Request;

    expect(getTokenFromHeader(mockRequest)).toBe(null)
    mockRequest.headers.authorization = 'Bearer RANDOMJWTTOKEN123123'
    expect(getTokenFromHeader(mockRequest)).toBe('RANDOMJWTTOKEN123123')
  });
});

describe('auth.js authTokenRequest', () => {
  let mockRequest: Request;
  let mockResponse: Response;
  let mockUser: any;
  let mockToken: any;
  let mockNext: jest.Mock;
  let spyDiscordClientUsers: jest.SpyInstance;
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
    };

    mockToken = {
      key: 123456,
      createdAt: Date.now(),
      userId: '123456789',
    };

    mockNext = jest.fn();
    spyLogger = jest.spyOn(loggerFile, 'error');
    spyDiscordClientUsers = jest.spyOn(client.users.cache, 'get');

    jest.mock('../src/configuration/discord.ts');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log error if wrong tokenRequest is provided', () => {

    // no body
    authTokenRequest(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls[0][0]).toEqual(new ApiError(400, "\"username\" is required"));

    // number as username (userid instead of username)
    mockRequest.body.username = 12312312312312;

    authTokenRequest(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(2);
    expect(mockNext.mock.calls.length).toBe(2);
    expect(mockNext.mock.calls[1][0]).toEqual(new ApiError(400, "\"username\" must be a string"));
  });

  it('should log error if unkown user is provided', async () => {
    mockRequest.body.username = "testuser2#123123";
    mockingoose(User).toReturn(null, 'findOne');

    await authTokenRequest(mockRequest, mockResponse, mockNext);

    expect(mockNext.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls[0][0]).toEqual(new ApiError(404, `Nutzer ${mockRequest.body.username} nicht gefunden`));
    expect(spyLogger.mock.calls.length).toBe(1);
    expect(spyLogger.mock.calls[0][0]).toBe(`Nutzer ${mockRequest.body.username} nicht gefunden`);
  });

  it('should log error if token creation fails', async () => {
    const testError = new Error('Fehler!');

    mockRequest.body.username = mockUser.userName;
    mockingoose(User).toReturn(mockUser, 'findOne');
    mockingoose(AuthToken).toReturn(testError, 'save');

    await authTokenRequest(mockRequest, mockResponse, mockNext);

    expect(mockNext.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls[0][0]).toEqual(testError);
    expect(spyLogger.mock.calls.length).toBe(1);
    expect(spyLogger.mock.calls[0][0]).toBe(testError.message);
  });

  it('should log error if discord user is not in cache', async () => {
    mockRequest.body.username = mockUser.userName;
    mockingoose(User).toReturn(mockUser, 'findOne');
    mockingoose(AuthToken).toReturn(mockToken, 'save');

    spyDiscordClientUsers.mockReturnValue(null);


    await authTokenRequest(mockRequest, mockResponse, mockNext);

    expect(mockNext.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls[0][0]).toEqual(new ApiError(409, `${mockUser.userName} nicht im Discord Cache. Schreibe dem Bot eine kleine 'Test' Nachricht (per DM) und versuche es erneut.`));
    expect(spyLogger.mock.calls.length).toBe(1);
    expect(spyLogger.mock.calls[0][0]).toBe(`${mockUser.userName} nicht im Discord Cache. Schreibe dem Bot eine kleine 'Test' Nachricht (per DM) und versuche es erneut.`);
  });

  it('should send token to user if everything is fine', async () => {
    mockRequest.body.username = mockUser.userName;
    mockingoose(User).toReturn(mockUser, 'findOne');
    mockingoose(AuthToken).toReturn(mockToken, 'save');

    const mockDiscordUser = { send: jest.fn()};
    spyDiscordClientUsers.mockReturnValue(mockDiscordUser);

    await authTokenRequest(mockRequest, mockResponse, mockNext);
    
    // user with correct id should have been requested
    expect(spyDiscordClientUsers.mock.calls.length).toBe(1);
    expect(spyDiscordClientUsers.mock.calls[0][0]).toBe(mockUser.userId);

    // messages should be send
    expect(mockDiscordUser.send.mock.calls.length).toBe(2);
    expect(mockDiscordUser.send.mock.calls[0][0]).toBe(`:key: **Es wurde ein Zugangstoken angefordert**\n Zugangstoken lautet: ${mockToken.key}\n`);
    expect(mockDiscordUser.send.mock.calls[1][0]).toBe(`Solltest du den Token nicht angefordert haben-Kein Problem, lösche diese Nachricht einfach`);

    // no error have to be logged
    expect(mockNext.mock.calls.length).toBe(0);
    expect(spyLogger.mock.calls.length).toBe(0);
    expect(mockDiscordUser.send.mock.calls.length).toBe(2);

  });
})

describe('auth.js authLoginRequest', () => {
  let mockRequest: Request;
  let mockResponse: Response;
  let mockUser: any;
  let mockToken: any;
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
    };

    mockToken = {
      key: 123456,
      createdAt: Date.now(),
      userId: '123456789',
    };

    mockNext = jest.fn();
    spyLogger = jest.spyOn(loggerFile, 'error');

    jest.mock('../src/configuration/discord.ts')
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('should log error if wrong authRequest is provided', async () => {
    // no body
    await authLoginRequest(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls[0][0]).toEqual(new ApiError(400, "\"username\" is required"));

    // number as username (userid instead of username)
    mockRequest.body.username = 12312312312312;

    await authLoginRequest(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(2);
    expect(mockNext.mock.calls.length).toBe(2);
    expect(mockNext.mock.calls[1][0]).toEqual(new ApiError(400, "\"username\" must be a string")); 
    
    // no token
    mockRequest.body.username = mockUser.userName;

    await authLoginRequest(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(3);
    expect(mockNext.mock.calls.length).toBe(3);
    expect(mockNext.mock.calls[2][0]).toEqual(new ApiError(400, "\"token\" is required"));
    
    // token is too small
    mockRequest.body.username = mockUser.userName;
    mockRequest.body.token = "12312";

    await authLoginRequest(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(4);
    expect(mockNext.mock.calls.length).toBe(4);
    expect(mockNext.mock.calls[3][0]).toEqual(new ApiError(400, "\"token\" must be greater than 100000"));

    // no successfull response
    expect((mockResponse.status as jest.Mock).mock.calls.length).toBe(0);
    expect((mockResponse.json as jest.Mock).mock.calls.length).toBe(0);
  });

  it('should log error if unkown user is provided', async () => {
    mockRequest.body.username = "testuser2#123123";
    mockRequest.body.token = mockToken.key;
    mockingoose(User).toReturn(null, 'findOne');

    await authLoginRequest(mockRequest, mockResponse, mockNext);

    expect(mockNext.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls[0][0]).toEqual(new ApiError(404, `Nutzer ${mockRequest.body.username} nicht gefunden`));
    expect(spyLogger.mock.calls.length).toBe(1);
    expect(spyLogger.mock.calls[0][0]).toBe(`Nutzer ${mockRequest.body.username} nicht gefunden`);

    // no successfull response
    expect((mockResponse.status as jest.Mock).mock.calls.length).toBe(0);
    expect((mockResponse.json as jest.Mock).mock.calls.length).toBe(0);
  });
  
  it('should log error if token is unknown', async () => {
    mockRequest.body.username = mockUser.userName;
    mockRequest.body.token = mockToken.key;
    mockingoose(User).toReturn(mockUser, 'findOne');
    mockingoose(AuthToken).toReturn(null, 'findOne');

    await authLoginRequest(mockRequest, mockResponse, mockNext);

    expect(mockNext.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls[0][0]).toEqual(new ApiError(404, `Invalid token!`));
    expect(spyLogger.mock.calls.length).toBe(1);
    expect(spyLogger.mock.calls[0][0]).toBe('Invalid token!');

    // no successfull response
    expect((mockResponse.status as jest.Mock).mock.calls.length).toBe(0);
    expect((mockResponse.json as jest.Mock).mock.calls.length).toBe(0);
  });

  it('should log error if token is wrong', async () => {
    mockRequest.body.username = mockUser.userName;
    mockRequest.body.token = '123123';

    // change mockToken for this test
    mockToken.userId = "8912381723";

    mockingoose(User).toReturn(mockUser, 'findOne');
    mockingoose(AuthToken).toReturn(mockToken, 'findOne');

    await authLoginRequest(mockRequest, mockResponse, mockNext);

    expect(mockNext.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls[0][0]).toEqual(new ApiError(404, `Invalid token!`));
    expect(spyLogger.mock.calls.length).toBe(1);
    expect(spyLogger.mock.calls[0][0]).toBe('Invalid token!');

    // no successfull response
    expect((mockResponse.status as jest.Mock).mock.calls.length).toBe(0);
    expect((mockResponse.json as jest.Mock).mock.calls.length).toBe(0);

  });

  it('should response with jwt if everything is fine', async () => {
    mockRequest.body.username = mockUser.userName;
    mockRequest.body.token = mockToken.key;

    mockingoose(User).toReturn(mockUser, 'findOne');
    mockingoose(AuthToken).toReturn(mockToken, 'findOne');

    await authLoginRequest(mockRequest, mockResponse, mockNext);

    expect((mockResponse.status as jest.Mock).mock.calls.length).toBe(1);
    expect((mockResponse.status as jest.Mock).mock.calls[0][0]).toBe(200);
    expect((mockResponse.json as jest.Mock).mock.calls.length).toBe(1);
    expect((mockResponse.json as jest.Mock).mock.calls[0][0]).not.toBe(null);

    // no error
    expect(mockNext.mock.calls.length).toBe(0);
    expect(spyLogger.mock.calls.length).toBe(0);
  });

});