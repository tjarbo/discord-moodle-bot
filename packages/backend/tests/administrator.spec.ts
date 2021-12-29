import { loggerFile } from "../src/configuration/logger";
import { adminAdministratorPostRequest, adminAdministratorDeleteRequest, adminAdministratorGetRequest } from "../src/controllers/administrator";
import * as mockingoose from 'mockingoose';
import { Request, Response } from "express";
import { RegistrationToken } from "../src/controllers/authentication/registrationToken.schema";
import { Administrator } from '../src/controllers/administrator/administrator.schema';
import { ApiError, ApiSuccess } from "../src/utils/api";
import { JWT } from "../src/controllers/authentication";

jest.mock('../src/configuration/environment.ts');

describe('administrator/index.ts adminAdministratorPostRequest', () => {

  let mockRequest: Request & JWT;
  let mockResponse: Response;
  let mockNext: jest.Mock;
  let spyLogger: jest.SpyInstance;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      body: {},
      token: {}
    } as Request & JWT;

    mockResponse = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
      send: jest.fn(),
      end: jest.fn()
    } as any as Response;

    mockNext = jest.fn();
    spyLogger = jest.spyOn(loggerFile, 'error');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return token', async () => {
    // This actually does not return null, but it makes the unit test works
    mockingoose(RegistrationToken).toReturn(null, 'save');

    await adminAdministratorPostRequest(mockRequest, mockResponse, mockNext);

    expect(spyLogger.mock.calls.length).toBe(0);
    expect(mockNext.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls[0][0].data.token).not.toBeFalsy;
    expect(mockNext.mock.calls[0][0].data.origin).not.toBeFalsy;
    expect(mockNext.mock.calls[0][0].data.lifetime).not.toBeFalsy;

  });
});


describe('administrator/index.ts adminAdministratorGetRequest', () => {

  let mockRequest: Request;
  let mockResponse: Response;
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

    mockNext = jest.fn();
    spyLogger = jest.spyOn(loggerFile, 'error');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log error if database fails', async () => {
    mockingoose(Administrator).toReturn(null, 'find');

    await adminAdministratorGetRequest(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls[0][0]).toEqual(new ApiError(500, `Internal error while retrieving administrators`));
  });

  it('should return list of administrators', async () => {
    let mockAdministrator = [
      {
        username: "TestUserName",
        deletable: false,
        createdAt: new Date().valueOf(),
      },
      {
        username: "TestUserName",
        deletable: true,
        createdAt: new Date().valueOf(),
        device: {}
      },
    ];

    mockingoose(Administrator).toReturn(mockAdministrator, 'find');
    await adminAdministratorGetRequest(mockRequest, mockResponse, mockNext);

    expect(spyLogger.mock.calls.length).toBe(0);
    expect(mockNext.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls[0][0].data.length).toEqual(mockAdministrator.length);
  });

});


describe('administrator/index.ts adminAdministratorDeleteRequest', () => {

  let mockRequest: Request & JWT;
  let mockResponse: Response;
  let mockNext: jest.Mock;
  let spyLogger: jest.SpyInstance;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      body: {},
      params: {},
      query: {},
      token: {}
    } as Request & JWT;

    mockResponse = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
      send: jest.fn(),
      end: jest.fn()
    } as any as Response;

    mockNext = jest.fn();
    spyLogger = jest.spyOn(loggerFile, 'error');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should validate user input', async () => {
    const tests = [
      {
        // no parameters
        prepare: () => { },
        expect: new ApiError(400, '"username" is required')
      },
      {
        // username not alphanumeric
        prepare: () => { mockRequest.params.username = "test@1234"; },
        expect: new ApiError(400, '"username" does not match any of the allowed types')
    }];

    for (let index = 0; index < tests.length; index++) {
      // preparation
      tests[index].prepare()

      // execute and compare
      await adminAdministratorDeleteRequest(mockRequest, mockResponse, mockNext);
      expect(spyLogger.mock.calls.length).toBe(index+1);
      expect(mockNext.mock.calls.length).toBe(index+1);
      expect(mockNext.mock.calls[index][0]).toEqual(tests[index].expect);
    };
  });

  it('should throw error if administrator has not been found', async () => {

    mockRequest.params.username = "useruser";
    mockingoose(Administrator).toReturn(null, 'findOne');

    await adminAdministratorDeleteRequest(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls[0][0]).toEqual(new ApiError(404, `Administrator ${mockRequest.params.username} not found`));
  });

  
  it('should throw error if administrator is not deletable', async () => {
    mockRequest.params.username = "useruser";
    mockingoose(Administrator).toReturn({ deletable: false }, 'findOne');

    await adminAdministratorDeleteRequest(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls[0][0]).toEqual(new ApiError(403, `Administrator ${mockRequest.params.username} is not deletable`));

  });

  it.skip('should return 204 if deletion was successful', async () => {

    /**
     * Need to skip, because mocking deleteOne does not work.
     * Test failed due to timeout :(
     */
    mockRequest.params.username = "useruser";
    expect.assertions(1);
    const mockAdministrator = { delete: true, deleteOne: () => Promise.resolve("asd") };
    mockingoose(Administrator).toReturn(mockAdministrator, 'findOne');
    mockingoose(Administrator).toReturn("asd", 'deleteOne');

    await adminAdministratorDeleteRequest(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(0);
    expect(mockNext.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls[0][0]).toEqual(new ApiSuccess(204));
  });
});

