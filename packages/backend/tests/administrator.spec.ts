import { loggerFile } from "../src/configuration/logger";
import { addAdministratorRequest, deleteAdministratorRequest, getAdministratorListRequest } from "../src/controllers/administrator";
import mockingoose from 'mockingoose';
import { Request, Response } from "express";
import { Administrator } from "../src/controllers/administrator/administrator.schema";
import { ApiError, ApiSuccess } from "../src/utils/api";

jest.mock('../src/configuration/environment.ts');

describe('administrator/index.ts addAdministratorRequest', () => {

  let mockRequest: Request;
  let mockResponse: Response;
  let mockUser: any;
  let mockAdministrator: any;
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
      username: 'test#1231',
      userid: '123456789123456789',
    }

    mockAdministrator = {};

    mockNext = jest.fn();
    spyLogger = jest.spyOn(loggerFile, 'error');

  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  it('should log error if wrong addAdministratorRequest provided', async () => {
    // no body
    await addAdministratorRequest(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls[0][0]).toEqual(new ApiError(400, '"username" is required'));

    // number as username (userid instead of username)
    mockRequest.body.username = 12312312312312;

    await addAdministratorRequest(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(2);
    expect(mockNext.mock.calls.length).toBe(2);
    expect(mockNext.mock.calls[1][0]).toEqual(new ApiError(400, '"username" must be a string'));

    // no userid
    mockRequest.body.username = mockUser.username;
    delete mockRequest.body.userid;

    await addAdministratorRequest(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(3);
    expect(mockNext.mock.calls.length).toBe(3);
    expect(mockNext.mock.calls[2][0]).toEqual(new ApiError(400, '"userid" is required'));

    mockRequest.body.userid = '123123123123';
    /*
    // invalid user name (to less or many numbers)
    mockRequest.body.username = "invalid#123";

    await addAdministratorRequest(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(4);
    expect(mockNext.mock.calls.length).toBe(4);
    expect(mockNext.mock.calls[3][0]).toEqual(new ApiError(400, '"username" with value "invalid#123" fails to match the required pattern: /[\\w\\s]+#[0-9]{4}/'));
    
    mockRequest.body.username = "invalid#12345";

    await addAdministratorRequest(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(5);
    expect(mockNext.mock.calls.length).toBe(5);
    expect(mockNext.mock.calls[4][0]).toEqual(new ApiError(400, '"username" with value "invalid#12345" fails to match the required pattern: /[\w\s]+#[0-9]{4}/'));
    */
  });

  it('should log error if administrator with same username exists', async () => {

    mockRequest.body = mockUser;

    // Same username
    mockAdministrator.userName = mockUser.username;
    mockingoose(Administrator).toReturn(mockAdministrator, 'findOne');

    await addAdministratorRequest(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls[0][0]).toEqual(new ApiError(400, `Administrator ${mockUser.username} already exists`));

    // Same userid
    mockAdministrator.userName = 'testuser#9999'
    mockAdministrator.userId = mockUser.userid;
    mockingoose(Administrator).toReturn(mockAdministrator, 'findOne');

    await addAdministratorRequest(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(2);
    expect(mockNext.mock.calls.length).toBe(2);
    expect(mockNext.mock.calls[1][0]).toEqual(new ApiError(400, `Administrator with ID ${mockUser.userid} already exists`));
  });

  it('should save new Administrator and send response if everything is fine', async () => {

    mockRequest.body = mockUser;
    mockingoose(Administrator).toReturn(null, 'findOne');
    mockingoose(Administrator).toReturn(null, 'save');

    await addAdministratorRequest(mockRequest, mockResponse, mockNext);

    expect(mockNext.mock.calls.length).toBe(1);
    expect((mockNext.mock.calls[0][0] as ApiSuccess)).toEqual(new ApiSuccess(201));

    // no error
    expect(spyLogger.mock.calls.length).toBe(0);
  });
});

describe('administrator/index.ts getAdministratorListRequest', () => {

  let mockRequest: Request;
  let mockResponse: Response;
  let mockUser: any;
  let mockAdministrator: any;
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
      username: 'test#1231',
      userid: '123456789123456789',
    }

    mockAdministrator = {};

    mockNext = jest.fn();
    spyLogger = jest.spyOn(loggerFile, 'error');

  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log error if database fails', async () => {
    mockingoose(Administrator).toReturn(null, 'find');

    await getAdministratorListRequest(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls[0][0]).toEqual(new ApiError(503, `Internal error while retrieving administrators`));
  });

  it('should return list of administrators', async () => {
    mockAdministrator = [
      {
        userName: "TestUserName",
        userId: "TestUserId",
        deletable: true,
        createdAt: new Date().valueOf(),
      },
      {
        userName: "TestUserName",
        userId: "TestUserId",
        deletable: true,
        createdAt: new Date().valueOf(),
      },
    ];

    mockingoose(Administrator).toReturn(mockAdministrator, 'find');
    await getAdministratorListRequest(mockRequest, mockResponse, mockNext);

    expect(spyLogger.mock.calls.length).toBe(0);
    expect(mockNext.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls[0][0]).toEqual(new ApiSuccess(200, mockAdministrator));

  });

});


describe('administrator/index.ts deleteAdministratorRequest', () => {

  let mockRequest: Request;
  let mockResponse: Response;
  let mockUser: any;
  let mockAdministrator: any;
  let mockNext: jest.Mock;
  let spyLogger: jest.SpyInstance;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      body: {},
      params: {},
    } as Request;

    mockResponse = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
      send: jest.fn(),
      end: jest.fn()
    } as any as Response;

    mockUser = {
      username: 'test#1231',
      userid: '123456789123456789',
    }

    mockAdministrator = {};

    mockNext = jest.fn();
    spyLogger = jest.spyOn(loggerFile, 'error');

  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log error if wrong deleteAdministratorRequestSchema provided', async () => {
    
    // no body
    await deleteAdministratorRequest(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls[0][0]).toEqual(new ApiError(400, '"value" is required'));

    // id too short
    mockRequest.params.id = "12312312312312";

    await deleteAdministratorRequest(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(2);
    expect(mockNext.mock.calls.length).toBe(2);
    expect(mockNext.mock.calls[1][0]).toEqual(new ApiError(400, `"value" with value "${mockRequest.params.id}" fails to match the required pattern: /^\\d{18}$/`));

    // id with letters
    mockRequest.params.id = "12312312312312";

    await deleteAdministratorRequest(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(3);
    expect(mockNext.mock.calls.length).toBe(3);
    expect(mockNext.mock.calls[2][0]).toEqual(new ApiError(400, `"value" with value "${mockRequest.params.id}" fails to match the required pattern: /^\\d{18}$/`));

  });

  it('should log error if administrator has not been found', async () => {

    mockRequest.params.id = "123456789012345678";
    mockingoose(Administrator).toReturn(null, 'findOne');

    await deleteAdministratorRequest(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls[0][0]).toEqual(new ApiError(404, `Administrator with id ${mockRequest.params.id} not found in database`));

  });
  
  it('should log error if administrator is not deletable', async () => {


    mockRequest.params.id = "123456789012345678";
    mockAdministrator.deletable = false;
    mockingoose(Administrator).toReturn(mockAdministrator, 'findOne');

    await deleteAdministratorRequest(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls[0][0]).toEqual(new ApiError(403, `Administrator with id ${mockRequest.params.id} is not deletable`));

  });

  it('should return 200 if deletion was successful', async () => {
  
    mockRequest.params.id = "123456789012345678";
    mockAdministrator.deletable = true;
    mockAdministrator.deleteOne = async () => { };
    mockingoose(Administrator).toReturn(mockAdministrator, 'findOne');
  
    await deleteAdministratorRequest(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(0);
    expect(mockNext.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls[0][0]).toEqual(new ApiSuccess(204));

  });
});
