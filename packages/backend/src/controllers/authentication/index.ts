/**
 * Auth.js manages the user authentication for the REST-API
 */

import { Request, Response, NextFunction } from 'express';
import { object } from '@hapi/joi';
import { Administrator, administratorUsernameValidationSchema, IAdministratorDocument } from '../administrator/administrator.schema';
import { loggerFile } from '../../configuration/logger';
import jwt from 'jsonwebtoken';
import expressjwt from 'express-jwt';
import { config } from '../../configuration/environment';
import { ApiError, ApiSuccess } from '../../utils/api';
import { generateAssertionOptions, generateAttestationOptions, GenerateAttestationOptionsOpts, verifyAssertionResponse, verifyAttestationResponse } from '@simplewebauthn/server';
import { RegistrationToken, registrationTokenValidationSchema } from './registrationToken.schema';
import { IAuthenticatorDocument } from '../administrator/authenticator.schema';

/****************************************
 *       User input validation          *
 * **************************************/
const authAssertionGetRequestSchema = object({
  username: administratorUsernameValidationSchema,
});

const authAssertionPostRequestSchema = object({
  username: administratorUsernameValidationSchema,
  assertionResponse: object().unknown().required().description('Webauthn challenge')
});

const authAttestationGetRequestSchema = object({
  username: administratorUsernameValidationSchema,
  token: registrationTokenValidationSchema,
});

const authAttestationPostRequestSchema = object({
  username: administratorUsernameValidationSchema,
  token: registrationTokenValidationSchema,
  attestationResponse: object().unknown().required().description('Webauthn challenge')
});


/****************************************
 *          Helper functions            *
 * **************************************/

interface JSONWebToken {
  _id: string;
  username: string;
}

export type JWT = {
  token: {
    data: JSONWebToken,
    iat: number,
    exp: number,
  }
};

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
    username: user.username,
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
 * Middleware to ensure that the user is authenticated
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
    if (registrationTokenDoc === null) throw new ApiError(404, 'Registration token not found or expired');

    // 3. Get user document; create if it does not exist
    const userDoc = await Administrator.findOneAndUpdate({ username: attestationGetRequest.value.username }, {}, { upsert: true, new: true });
    if (userDoc.device) throw new ApiError(403, 'User already registered');

    // 4. Create attestation challenge
    const attestationOptionsOpts: GenerateAttestationOptionsOpts = {
      rpName: config.rp.name,
      rpID: config.rp.id,
      userID: userDoc._id,
      userName: userDoc.username.toString(),
      timeout: 60000,
      attestationType: 'indirect',
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
    if (registrationTokenDoc === null) throw new ApiError(404, 'Registration token not found or expired');

    // 3. Get user document
    const userDoc = await Administrator.findOne({ username: attestationPostRequest.value.username });
    if (userDoc === null) throw new ApiError(404, 'User not found');
    if (userDoc.device) throw new ApiError(403, 'User already registered');
    if (userDoc.currentChallenge === undefined || userDoc.currentChallenge === null) throw new ApiError(400, 'User has no pending challenge');

    // 4. Verify challenge
    try {
      const { verified, attestationInfo } = await verifyAttestationResponse({
        credential: attestationPostRequest.value.attestationResponse,
        expectedChallenge: userDoc.currentChallenge,
        expectedOrigin: config.rp.origin,
        expectedRPID: config.rp.id,
      });

      // If challenge has not been completed successfully, throw an error
      if (!verified || !attestationInfo) throw new ApiError(401, 'Challenge has not been solved correctly');

      // 5. Save authenticator
      const { credentialPublicKey, credentialID, counter } = attestationInfo;
      userDoc.device = { credentialID, credentialPublicKey, counter } as IAuthenticatorDocument;

      // 6. Save whether user is deletable or not
      userDoc.deletable = registrationTokenDoc.userIsDeletable;

      // 7. Delete registration token
      registrationTokenDoc.delete();

      // 8. Send jwt to user
      loggerFile.info(`${userDoc.username} registered successfully`);
      const response = new ApiSuccess(200, { 'accesstoken': generateJWToken(userDoc) });
      next(response);

    } catch (error) {
      // Looks like a bad request
      throw new ApiError(400, error.message);

    } finally {
      // 8. Delete challenge from user. To try again, it is necessary to request a new challenge
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
    const userDoc = await Administrator.findOne({ username: assertionGetRequest.value.username });
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
    const userDoc: IAdministratorDocument = await Administrator.findOne({ username: assertionPostRequest.value.username });
    if (userDoc === null) throw new ApiError(404, 'User not found');
    if (userDoc.device === null || userDoc.device === undefined) throw new ApiError(403, 'User not registered');
    if (userDoc.currentChallenge === undefined || userDoc.currentChallenge === null) throw new ApiError(400, 'User has no pending challenge');

    // 3. Get authenticator
    const authenticator = userDoc.device;

    // 4. Verify challenge
    try {
      const { verified, assertionInfo } = await verifyAssertionResponse({
        credential: assertionPostRequest.value.assertionResponse,
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
      loggerFile.info(`${userDoc.username} logged in successfully`);
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
