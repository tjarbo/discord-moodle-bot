import { loggerFile } from "../src/configuration/logger";
import { addAdministratorRequest } from "../src/controllers/administrator";
import mockingoose from 'mockingoose';
import { Request, Response } from "express";
import { ApiError } from "../src/controllers/error/api.class";
import { Administrator } from "../src/controllers/administrator/administrator.schema";


describe('administrator/index.ts addAdministratorRequest',() => {

  let mockRequest: Request;
  let mockResponse: Response;
  let mockUser: any;
  let mockAdministrator:any ;
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
      username: "test#1231",
      userid: '123123123',
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

    await addAdministratorRequest(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(3);
    expect(mockNext.mock.calls.length).toBe(3);
    expect(mockNext.mock.calls[2][0]).toEqual(new ApiError(400, '"userid" is required'));
  });

  it('should log error if administator with same username exists', async () => {

    mockRequest.body = mockUser;

    // Same username
    mockAdministrator.userName = mockUser.username; 
    mockingoose(Administrator).toReturn(mockAdministrator, 'findOne');

    await addAdministratorRequest(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls[0][0]).toEqual(new ApiError(400, `Administrator ${mockUser.username} already exists`));
    
    // Same userid
    mockAdministrator.userName = "testuser#9999"
    mockAdministrator.userId = mockUser.userid; 
    mockingoose(Administrator).toReturn(mockAdministrator, 'findOne');

    await addAdministratorRequest(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(2);
    expect(mockNext.mock.calls.length).toBe(2);
    expect(mockNext.mock.calls[1][0]).toEqual(new ApiError(400, `Administrator with ID ${mockUser.userid} already exists`));
  });

  it('should save new Administrator and send resonse if everything is fine', async () => { 
    
    mockRequest.body = mockUser;
    mockingoose(Administrator).toReturn(null, 'findOne');
    mockingoose(Administrator).toReturn(null, 'save');

    await addAdministratorRequest(mockRequest, mockResponse, mockNext);

    expect((mockResponse.status as jest.Mock)).toHaveBeenCalledTimes(1);
    expect((mockResponse.status as jest.Mock)).toHaveBeenCalledWith(201);
    expect((mockResponse.end as jest.Mock)).toHaveBeenCalledTimes(1);

    // no error
    expect(spyLogger.mock.calls.length).toBe(0);
    expect(mockNext.mock.calls.length).toBe(0);
  });
});