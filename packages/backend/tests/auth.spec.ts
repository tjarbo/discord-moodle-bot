// mock relevant imports
import { getTokenFromHeader, authLogin, authRequestToken } from '../src/controllers/authentication/auth';
import { User } from '../src/controllers/user/user.schema';
import { Request, Response } from 'express';
import mockingoose from 'mockingoose';
import { loggerFile } from '../src/configuration/logger';
import { ApiError } from '../src/controllers/error/api.class';
import { AuthToken } from '../src/controllers/authentication/token.schema';
import { client } from '../src/configuration/discord';

jest.useFakeTimers();

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

describe('auth.js authRequestToken', () => {
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
      userId: '123123123123',
    };

    mockNext = jest.fn();
    spyLogger = jest.spyOn(loggerFile, 'error');
    spyDiscordClientUsers = jest.spyOn(client.users.cache, 'get');

    jest.mock('../src/configuration/discord.ts')
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  it('should log error if wrong tokenRequest is provided', () => {

    // no body
    authRequestToken(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls[0][0]).toEqual(new ApiError(400, "\"username\" is required"));

    // number as username (userid instead of username)
    mockRequest.body.username = 12312312312312;

    authRequestToken(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(2);
    expect(mockNext.mock.calls.length).toBe(2);
    expect(mockNext.mock.calls[1][0]).toEqual(new ApiError(400, "\"username\" must be a string"));
  });

  it('should log error if unkown user is provided', async () => {
    mockRequest.body.username = "testuser2#123123";
    mockingoose(User).toReturn(null, 'findOne');

    await authRequestToken(mockRequest, mockResponse, mockNext);

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

    await authRequestToken(mockRequest, mockResponse, mockNext);

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


    await authRequestToken(mockRequest, mockResponse, mockNext);

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

    await authRequestToken(mockRequest, mockResponse, mockNext);
    
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