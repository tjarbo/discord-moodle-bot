// mock relevant imports
import { getTokenFromHeader, authAssertionGetRequest, authAttestationGetRequest, authAssertionPostRequest, authAttestationPostRequest } from '../src/controllers/authentication';
import { Administrator, IAdministratorDocument } from '../src/controllers/administrator/administrator.schema';
import { Request, Response } from 'express';
import * as mockingoose from 'mockingoose';
import { loggerFile } from '../src/configuration/logger';
import { ApiError } from "../src/utils/api";
import { RegistrationToken } from '../src/controllers/authentication/registrationToken.schema';
import { v4 as uuidv4 } from "uuid";
import { IAuthenticatorDocument } from '../src/controllers/administrator/authenticator.schema';

jest.mock('../src/configuration/environment.ts');

describe('auth/index.ts getTokenFromHeader', () => {
  it('should return the correct jwt', () => {
    const mockRequest = {
      headers: {},
      body: {},
    } as Request;

    expect(getTokenFromHeader(mockRequest)).toBe(null);
    mockRequest.headers.authorization = 'Bearer RANDOMJWTTOKEN123123';
    expect(getTokenFromHeader(mockRequest)).toBe('RANDOMJWTTOKEN123123');
  });
});

describe('auth/index.ts authAttestationGetRequest', () => {
  let mockRequest: Request;
  let mockResponse: Response;
  let mockUser: IAdministratorDocument;
  let mockNext: jest.Mock;
  let fakeAuthenticator: IAuthenticatorDocument;
  let spyLogger: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();

    mockRequest = {
      headers: {},
      body: {},
      query: {},
    } as Request;

    mockResponse = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
      send: jest.fn(),
      end: jest.fn()
    } as any as Response;

    fakeAuthenticator = {
      credentialID: Buffer.from('null'),
      credentialPublicKey: Buffer.from('null'),
      counter: 0
    } as IAuthenticatorDocument;

    mockNext = jest.fn();

    mockUser = new Administrator({ username : "testuser123" });
    mockUser.save = jest.fn();
    
    spyLogger = jest.spyOn(loggerFile, 'error');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should validate user input', async () => {

    const tests = [
      {
        // no parameters
        prepare: () => {},
        expect: new ApiError(400, '"username" is required')
      },
      {
        // username not alphanumeric or discord username
        prepare: () => { mockRequest.query.username = "test@1234"; },
        expect: new ApiError(400, '"username" does not match any of the allowed types')
      },
      {
        // token not provided
        prepare: () => { mockRequest.query.username = "testuser123"; },
        expect: new ApiError(400, '"token" is required')
      },
      {
        // token must be uuid
        prepare: () => { mockRequest.query.token = "123123-1231231231231231-ljöljkök"; },
        expect: new ApiError(400, '"token" contains an invalid value')
      }
    ]
    
    for (let index = 0; index < tests.length; index++) {
      // preparation
      tests[index].prepare()

      // execute and compare 
      await authAttestationGetRequest(mockRequest, mockResponse, mockNext);
      expect(spyLogger.mock.calls.length).toBe(index+1);
      expect(mockNext.mock.calls.length).toBe(index+1);
      expect(mockNext.mock.calls[index][0]).toEqual(tests[index].expect);
    }  
  });

  it('should throw error if registration token is wrong', async () => {
    mockRequest.query = {
      username: 'testuser123',
      token: uuidv4(),
    }

    mockingoose(RegistrationToken).toReturn(null, 'findOne')

    await authAttestationGetRequest(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls[0][0]).toEqual(new ApiError(404, 'Registration token not found or expired'));
  });
 
  it('should throw error if user already registered', async () => {
    mockRequest.query = {
      username: 'testuser123',
      token: uuidv4(),
    }

    mockUser.device = fakeAuthenticator;

    mockingoose(Administrator).toReturn(mockUser, 'findOneAndUpdate')
    mockingoose(RegistrationToken).toReturn(new RegistrationToken(), 'findOne')

    await authAttestationGetRequest(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls[0][0]).toEqual(new ApiError(403, 'User already registered'));
  });

  it('should return challenge if everything is okay', async () => {
    mockRequest.query = {
      username: 'testuser123',
      token: uuidv4(),
    }

    mockingoose(RegistrationToken).toReturn(new RegistrationToken(), 'findOne')
    mockingoose(Administrator).toReturn(mockUser, 'findOneAndUpdate')

    await authAttestationGetRequest(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(0);
    expect(mockNext.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls[0][0].code).toEqual(200);
    expect(mockNext.mock.calls[0][0].data).not.toEqual({});
  });
});

describe('auth/index.ts authAttestationPostRequest', () => {
  let mockRequest: Request;
  let mockResponse: Response;
  let mockUser: IAdministratorDocument;
  let mockNext: jest.Mock;
  let fakeAuthenticator: IAuthenticatorDocument;
  let spyLogger: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();

    mockRequest = {
      headers: {},
      body: {},
      query: {},
    } as Request;

    mockResponse = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
      send: jest.fn(),
      end: jest.fn()
    } as any as Response;

    mockNext = jest.fn();

    mockUser = new Administrator({ username : "testuser123" });

    fakeAuthenticator = {
      credentialID: Buffer.from('null'),
      credentialPublicKey: Buffer.from('null'),
      counter: 0
    } as IAuthenticatorDocument;
    
    spyLogger = jest.spyOn(loggerFile, 'error');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should validate user input', async () => {

    const tests = [
      {
        // no parameters
        prepare: () => {},
        expect: new ApiError(400, '"username" is required')
      },
      {
        // username not alphanumeric or discord username
        prepare: () => { mockRequest.body.username = "test@1234"; },
        expect: new ApiError(400, '"username" does not match any of the allowed types')
      },
      {
        // token not provided
        prepare: () => { mockRequest.body.username = "testuser123"; },
        expect: new ApiError(400, '"token" is required')
      },
      {
        // token must be uuid
        prepare: () => { mockRequest.body.token = "123123-1231231231231231-ljöljkök"; },
        expect: new ApiError(400, '"token" contains an invalid value')
      },
      {
        // attestationResponse must be provided
        prepare: () => { mockRequest.body.token = uuidv4(); },
        expect: new ApiError(400, '"attestationResponse" is required'),
      },
      {
        // attestationResponse must be object
        prepare: () => { mockRequest.body.attestationResponse = "thisisareponse"; },
        expect: new ApiError(400, '"attestationResponse" must be of type object'),
      }
    ]
    
    for (let index = 0; index < tests.length; index++) {
      // preparation
      tests[index].prepare()

      // execute and compare 
      await authAttestationPostRequest(mockRequest, mockResponse, mockNext);
      expect(spyLogger.mock.calls.length).toBe(index+1);
      expect(mockNext.mock.calls.length).toBe(index+1);
      expect(mockNext.mock.calls[index][0]).toEqual(tests[index].expect);
    }  
  });

  it('should throw error if registration token is wrong', async () => {
    mockRequest.body = {
      username: 'testuser123',
      token: uuidv4(),
      attestationResponse: {},
    }

    mockingoose(RegistrationToken).toReturn(null, 'findOne')

    await authAttestationPostRequest(mockRequest, mockResponse, mockNext);
    expect(spyLogger.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls[0][0]).toEqual(new ApiError(404, 'Registration token not found or expired'));
  });
 
  it('should throw error if something went wrong with the user', async () => {

    const tests = [
      {
        // unknown user
        prepare: () => {
          mockingoose(Administrator).toReturn(null, 'findOne')
        },
        expect: new ApiError(404, 'User not found')
      },
      {
        // user already registered
        prepare: () => {
          mockUser.device = fakeAuthenticator;
          mockingoose(Administrator).toReturn(mockUser, 'findOne')
        },
        expect: new ApiError(403, 'User already registered')
      },
      {
        // user has no active challenge
        prepare: () => {
          mockUser.device = null
          mockingoose(Administrator).toReturn(mockUser, 'findOne')
        },
        expect: new ApiError(400, 'User has no pending challenge')
      },

    ]

    mockRequest.body = {
      username: "testuser123",
      token: uuidv4(),
      attestationResponse: {}
    }
    
    mockingoose(RegistrationToken).toReturn(new RegistrationToken(), 'findOne')

    for (let index = 0; index < tests.length; index++) {
      // preparation
      tests[index].prepare()

      // execute and compare 
      await authAttestationPostRequest(mockRequest, mockResponse, mockNext);
      expect(spyLogger.mock.calls.length).toBe(index+1);
      expect(mockNext.mock.calls.length).toBe(index+1);
      expect(mockNext.mock.calls[index][0]).toEqual(tests[index].expect);
    }    
  });

  it.skip('should return jwt if everything is okay', async () => {
    /**
      This is not implemented, because it is not possible to mock es modules very well
      according to https://jestjs.io/docs/ecmascript-modules

      For verifyAttestationResponse
     */
  });
});

describe('auth/index.ts authAssertionGetRequest', () => {
  let mockRequest: Request;
  let mockResponse: Response;
  let mockUser: IAdministratorDocument;
  let mockNext: jest.Mock;
  let fakeAuthenticator: IAuthenticatorDocument;
  let spyLogger: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();

    mockRequest = {
      headers: {},
      body: {},
      query: {},
    } as Request;

    mockResponse = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
      send: jest.fn(),
      end: jest.fn()
    } as any as Response;

    mockNext = jest.fn();

    mockUser = new Administrator({ username : "testuser123" })
    mockUser.save = jest.fn();

    fakeAuthenticator = {
      credentialID: Buffer.from('null'),
      credentialPublicKey: Buffer.from('null'),
      counter: 0
    } as IAuthenticatorDocument;
    
    spyLogger = jest.spyOn(loggerFile, 'error');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should validate user input', async () => {

    const tests = [
      {
        // no parameters
        prepare: () => {},
        expect: new ApiError(400, '"username" is required')
      },
      {
        // username not alphanumeric or discord username
        prepare: () => { mockRequest.query.username = "test@1234"; },
        expect: new ApiError(400, '"username" does not match any of the allowed types')
      },
    ]
    
    for (let index = 0; index < tests.length; index++) {
      // preparation
      tests[index].prepare()

      // execute and compare 
      await authAssertionGetRequest(mockRequest, mockResponse, mockNext);
      expect(spyLogger.mock.calls.length).toBe(index+1);
      expect(mockNext.mock.calls.length).toBe(index+1);
      expect(mockNext.mock.calls[index][0]).toEqual(tests[index].expect);
    }  
  });
  
   
  it('should throw error if something went wrong with the user', async () => {

    const tests = [
      {
        // unknown user
        prepare: () => {
          mockingoose(Administrator).toReturn(null, 'findOne')
        },
        expect: new ApiError(404, 'User not found')
      },
      {
        // user not registered
        prepare: () => {
          mockUser.device = null;
          mockingoose(Administrator).toReturn(mockUser, 'findOne')
        },
        expect: new ApiError(403, 'User not registered')
      },
    ]

    mockRequest.query = {
      username: "testuser123",
    }

    for (let index = 0; index < tests.length; index++) {
      // preparation
      tests[index].prepare()

      // execute and compare 
      await authAssertionGetRequest(mockRequest, mockResponse, mockNext);
      expect(spyLogger.mock.calls.length).toBe(index+1);
      expect(mockNext.mock.calls.length).toBe(index+1);
      expect(mockNext.mock.calls[index][0]).toEqual(tests[index].expect);
    }    
  });

  it('should return challenge if everything is okay', async () => {
    mockRequest.query = {
      username: 'testuser123',
    }

    mockUser.device = fakeAuthenticator;
    mockingoose(Administrator).toReturn(mockUser, 'findOne')

    await authAssertionGetRequest(mockRequest, mockResponse, mockNext);   
    expect(spyLogger.mock.calls.length).toBe(0);
    expect(mockNext.mock.calls.length).toBe(1);
    expect(mockNext.mock.calls[0][0].code).toEqual(200);
    expect(mockNext.mock.calls[0][0].data).not.toEqual({});
  });
});

describe('auth/index.ts authAssertionPostRequest', () => {
  let mockRequest: Request;
  let mockResponse: Response;
  let mockUser: IAdministratorDocument;
  let mockNext: jest.Mock;
  let fakeAuthenticator: IAuthenticatorDocument;
  let spyLogger: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();

    mockRequest = {
      headers: {},
      body: {},
      query: {},
    } as Request;

    mockResponse = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
      send: jest.fn(),
      end: jest.fn()
    } as any as Response;

    mockNext = jest.fn();

    mockUser = new Administrator({ username : "testuser123" });

    fakeAuthenticator = {
      credentialID: Buffer.from('null'),
      credentialPublicKey: Buffer.from('null'),
      counter: 0
    } as IAuthenticatorDocument;
    
    spyLogger = jest.spyOn(loggerFile, 'error');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should validate user input', async () => {

    const tests = [
      {
        // no parameters
        prepare: () => {},
        expect: new ApiError(400, '"username" is required')
      },
      {
        // username not alphanumeric or Discord
        prepare: () => { mockRequest.body.username = "test@1234"; },
        expect: new ApiError(400, '"username" does not match any of the allowed types')
      },
      {
        // assertionResponse must be provided
        prepare: () => { mockRequest.body.username = "test123456" },
        expect: new ApiError(400, '"assertionResponse" is required'),
      },
      {
        // assertionResponse must be object
        prepare: () => { mockRequest.body.assertionResponse = "thisisareponse" },
        expect: new ApiError(400, '"assertionResponse" must be of type object'),
      }
    ]
    
    for (let index = 0; index < tests.length; index++) {
      // preparation
      tests[index].prepare()

      // execute and compare 
      await authAssertionPostRequest(mockRequest, mockResponse, mockNext);
      expect(spyLogger.mock.calls.length).toBe(index+1);
      expect(mockNext.mock.calls.length).toBe(index+1);
      expect(mockNext.mock.calls[index][0]).toEqual(tests[index].expect);
    }  
  });

  it('should throw error if something went wrong with the user', async () => {

    const tests = [
      {
        // unknown user
        prepare: () => {
          mockingoose(Administrator).toReturn(null, 'findOne')
        },
        expect: new ApiError(404, 'User not found')
      },
      {
        // user already registered
        prepare: () => {
          mockUser.device = undefined;
          mockingoose(Administrator).toReturn(mockUser, 'findOne')
        },
        expect: new ApiError(403, 'User not registered')
      },
      {
        // user has no active challenge
        prepare: () => {
          mockUser.device = fakeAuthenticator;
          mockingoose(Administrator).toReturn(mockUser, 'findOne')
        },
        expect: new ApiError(400, 'User has no pending challenge')
      },

    ]

    mockRequest.body = {
      username: "testuser123",
      assertionResponse: {}
    }
    
    mockingoose(RegistrationToken).toReturn(new RegistrationToken(), 'findOne')

    for (let index = 0; index < tests.length; index++) {
      // preparation
      tests[index].prepare()

      // execute and compare 
      await authAssertionPostRequest(mockRequest, mockResponse, mockNext);
      expect(spyLogger.mock.calls.length).toBe(index+1);
      expect(mockNext.mock.calls.length).toBe(index+1);
      expect(mockNext.mock.calls[index][0]).toEqual(tests[index].expect);
    }    
  });

  it.skip('should return jwt if everything is okay', async () => {
    /**
      This is not implemented, because it is not possible to mock es modules very well
      according to https://jestjs.io/docs/ecmascript-modules

      For verifyAssertionResponse
     */
  });
});
