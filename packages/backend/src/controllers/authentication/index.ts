/**
 * Auth.js manages the user authentication for the REST-API
 */

import { Request, Response, NextFunction } from 'express';
import { object, string, CustomHelpers } from '@hapi/joi';
import { Administrator, IAdministratorDocument } from '../administrator/administrator.schema';
import { loggerFile } from '../../configuration/logger';
import jwt from 'jsonwebtoken';
import expressjwt from 'express-jwt';
import { config } from '../../configuration/environment';
import { ApiError, ApiSuccess } from '../../utils/api';
import { generateAssertionOptions, generateAttestationOptions, GenerateAttestationOptionsOpts, verifyAssertionResponse, verifyAttestationResponse } from '@simplewebauthn/server';
import { validate as validateUUID } from 'uuid';
import { RegistrationToken } from './registrationToken.schema';
import { Authenticator, IAuthenticatorDocument } from './authenticator.schema';

/****************************************
 *       User input validation          *
 * **************************************/
const isUUID = (value: any, helper: CustomHelpers) : any => {
  if (!validateUUID(value)) return helper.error('any.invalid');
  return value;
};

const authAssertionGetRequestSchema = object({
  username: string().alphanum().required().min(8).max(64).description('Username of admin to register'),
});

const authAssertionPostRequestSchema = object({
  username: string().alphanum().required().min(8).max(64).description('Username of admin to register'),
  assertionResponse: object().unknown().required().description('Webauthn challenge')
});

const authAttestationGetRequestSchema = object({
  username: string().alphanum().required().min(8).max(64).description('Username of admin to register'),
  token: string().required().custom(isUUID).description('Registration token'),
});

const authAttestationPostRequestSchema = object({
  username: string().alphanum().required().min(8).max(64).description('Username of admin to register'),
  token: string().required().custom(isUUID).description('Registration token'),
  attestationResponse: object().unknown().required().description('Webauthn challenge')
});


/****************************************
 *          Helper functions            *
 * **************************************/

/**
 * Generates a signed jwt token, which contains the user
 * object
 *
 * @param {IUserDocument} user
 * @returns jwt
 */
function generateJWToken(user: IAdministratorDocument) {
  const data = {
    _id: user._id,
    name: user.name,
  };
  const signature = config.jwt.secret;
  const expiration = config.jwt.expiresIn;

  return jwt.sign({ data, }, signature, { expiresIn: expiration });
}

/**
 * Returns the jwt from the request header
 *
 * ! export only for unit testing (rewire doesn't work :/ )
 * @param {Request} req
 * @returns {(string | null)} jwt or null
 */
export function getTokenFromHeader(req: Request): string | null {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  }

  return null;
}

/**
 * Middleware to ensure that to user is authenticated
 */
export const isAuth = expressjwt({
  algorithms: ['HS256'],
  getToken: getTokenFromHeader,
  userProperty: 'token',
  secret: config.jwt.secret,
});


/****************************************
 *          Endpoint Handlers           *
 * **************************************/


/**
 * Simple endpoint to verify that the user is authenticated
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 */
export function authVerify(req: Request, res: Response, next: NextFunction) {
  const response = new ApiSuccess(200);
  next(response);
}

/**
 * GET /webauthn/register
 *
 * Handles requests to create a new challenge that is required
 * to register a new device.
 *
 * Expect: token and username parameter
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 */
export async function authAttestationGetRequest(req: Request, res: Response, next: NextFunction) : Promise<void> {
  try {
    // 1. Validate user input
    const attestationGetRequest = authAttestationGetRequestSchema.validate(req.query);
    if (attestationGetRequest.error) throw new ApiError(400, attestationGetRequest.error.message);

    // 2. Validate registration token
    const registrationTokenDoc = await RegistrationToken.findOne({ 'key': attestationGetRequest.value.token });
    if (registrationTokenDoc === null) throw new ApiError(404, 'Registration token not found');

    // 3. Get user document; create if it does not exist
    let userDoc = await Administrator.findOneAndUpdate({ username: attestationGetRequest.value.username }, {}, { upsert: true, new: true });
    if (userDoc.device) throw new ApiError(403, 'User already registered');

    // 4. Create attestation challenge
    const attestationOptionsOpts: GenerateAttestationOptionsOpts = {
      rpName: config.rp.name,
      rpID: config.rp.id,
      userID: userDoc._id,
      userName: userDoc.username.toString(),
      timeout: 60000,
      attestationType: 'indirect',
      /**
       * Passing in a user's list of already-registered authenticator IDs here prevents users from
       * registering the same device multiple times. The authenticator will simply throw an error in
       * the browser if it's asked to perform an attestation when one of these ID's already resides
       * on it.
       
      excludeCredentials: [{
        id: userDoc.device.credentialID,
        type: 'public-key',
        transports: userDoc.device.transports,
      }],
      */
      /**
       * The optional authenticatorSelection property allows for specifying more constraints around
       * the types of authenticators that users to can use for attestation
       */
      authenticatorSelection: {
        userVerification: 'preferred',
        requireResidentKey: false,
      },
    };

    const attestationOptions = generateAttestationOptions(attestationOptionsOpts);

    // 5. Save current challenge to user
    userDoc.currentChallenge = attestationOptions.challenge;
    userDoc.save();

    // 4. Done
    const response = new ApiSuccess(200, attestationOptions);
    next(response);

  } catch (err) {
    loggerFile.error(err);
    next(err);
  }
}

/**
 * POST /webauthn/register
 *
 * Validates the attestation response done by user to register a new device
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 */
 export async function authAttestationPostRequest(req: Request, res: Response, next: NextFunction) : Promise<void> {
  try {
    // 1. Validate user input
    const attestationPostRequest = authAttestationPostRequestSchema.validate(req.body);
    if (attestationPostRequest.error) throw new ApiError(400, attestationPostRequest.error.message);

    // 2. Validate registration token
    const registrationTokenDoc = await RegistrationToken.findOne({ 'key': attestationPostRequest.value.token });
    if (registrationTokenDoc === null) throw new ApiError(404, 'Registration token not found');

    // 3. Get user document
    const userDoc = await Administrator.findOne({ username: attestationPostRequest.value.username });
    if (userDoc === null) throw new ApiError(404, 'User not found');
    if (userDoc.device) throw new ApiError(403, 'User already registered');
    if (userDoc.currentChallenge === undefined || userDoc.currentChallenge === null) throw new ApiError(400, 'User has no pending challenge');

    // 4. Verify challenge
    try {
      const { verified, attestationInfo } = await verifyAttestationResponse({
        credential: attestationPostRequest.value.challenge,
        expectedChallenge: userDoc.currentChallenge,
        expectedOrigin: config.rp.origin,
        expectedRPID: config.rp.id,
      });

      // If challenge has not been completed successfully, throw an error
      if (!verified || !attestationInfo) throw new ApiError(401, 'Challenge has not been solved correctly');

      // 5. Save authenticator
      const { credentialPublicKey, credentialID, counter } = attestationInfo;
      const authenticator = await new Authenticator({
        credentialID,
        credentialPublicKey,
        counter
      }).save();

      userDoc.device = authenticator;

      // 6. Send jwt to user
      const response = new ApiSuccess(200, { 'accesstoken': generateJWToken(userDoc) });
      next(response);

    } catch (error) {
      // Looks like a bad request
      throw new ApiError(400, error.message);

    } finally {
      // 7. Delete challenge from user. To try again, it is necessary to request a new challenge
      userDoc.currentChallenge = undefined;
      userDoc.save();
    }
  } catch (err) {
    loggerFile.error(err);
    next(err);
  }
}

/**
 * GET /webauthn/login
 *
 * Handles requests to create a new challenge that is required,
 * to login a user.
 *
 * Expect: username parameter
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 */
 export async function authAssertionGetRequest(req: Request, res: Response, next: NextFunction) : Promise<void> {
  try {
    // 1. Validate user input
    const assertionGetRequest = authAssertionGetRequestSchema.validate(req.query);
    if (assertionGetRequest.error) throw new ApiError(400, assertionGetRequest.error.message);

    // 2. Get user document
    const userDoc = await Administrator.findOne({ username: assertionGetRequest.value.username }).populate('device');
    if (userDoc === null) throw new ApiError(404, 'User not found');
    if (userDoc.device === null || userDoc.device === undefined) throw new ApiError(403, 'User not registered');

    // 3. Generate challenge
    const options = generateAssertionOptions({
      // Require users to use a previously-registered authenticator
      allowCredentials: [{
        id: userDoc.device.credentialID,
        type: 'public-key'
      }],
      userVerification: 'preferred',
    });

    // 4. Save current challenge
    userDoc.currentChallenge = options.challenge;
    userDoc.save();

    // 5. Done
    const response = new ApiSuccess(200, options);
    next(response);

  } catch (err) {
    loggerFile.error(err);
    next(err);
  }
}

/**
 * POST /webauthn/login
 *
 * Validates the challenge done by user to login
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 */
 export async function authAssertionPostRequest(req: Request, res: Response, next: NextFunction) : Promise<void> {
  try {
    // 1. Validate user input
    const assertionPostRequest = authAssertionPostRequestSchema.validate(req.body);
    if (assertionPostRequest.error) throw new ApiError(400, assertionPostRequest.error.message);

    // 2. Get user document
    const userDoc: IAdministratorDocument = await Administrator.findOne({ username: assertionPostRequest.value.username }).populate('device');
    if (userDoc === null) throw new ApiError(404, 'User not found');
    if (userDoc.device === null || userDoc.device === undefined) throw new ApiError(403, 'User not registered');
    if (userDoc.currentChallenge === undefined || userDoc.currentChallenge === null) throw new ApiError(400, 'User has no pending challenge');

    // 3. Get authenticator
    const authenticator = userDoc.device;

    // 4. Verify challenge
    try {
      const { verified, assertionInfo } = await verifyAssertionResponse({
        credential: assertionPostRequest.value.challenge,
        expectedChallenge: userDoc.currentChallenge,
        expectedOrigin: config.rp.origin,
        expectedRPID: config.rp.id,
        authenticator,
      });

      // If challenge has not been completed successfully, throw an error
      if (!verified || !assertionInfo) throw new ApiError(401, 'Challenge has not been solved correctly');

      // 5. Increase counter for authenticator
      authenticator.counter = assertionInfo.newCounter;
      authenticator.save();

      // 6. Send jwt to user
      const response = new ApiSuccess(200, { 'accesstoken': generateJWToken(userDoc) });
      next(response);

    } catch (error) {
      // Looks like a bad request
      throw new ApiError(400, error.message);

    } finally {
      // 7. Delete challenge from user. To try again, it is necessary to request a new challenge
      userDoc.currentChallenge = undefined;
      userDoc.save();
    }
  } catch (err) {
    loggerFile.error(err);
    next(err);
  }
}
