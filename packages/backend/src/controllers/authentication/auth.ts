/**
 * Auth.js manages the user authentification for the REST-API
 */

import { Request, Response, NextFunction } from 'express';
import { object, string, number } from '@hapi/joi';
import { Administrator, IAdministratorDocument } from '../administrator/administrator.schema';
import { loggerFile } from '../../configuration/logger';
import { AuthToken } from './token.schema';
import jwt from 'jsonwebtoken';
import expressjwt from 'express-jwt';
import { config } from '../../configuration/environment';
import { sendTo } from '../discord';
import { TokenRequestMessage } from '../discord/templates';
import { ApiError, ApiSuccess } from '../../utils/api';

const authTokenRequestSchema = object({
  username: string().required().regex(/[\w\s]+#[0-9]+/).description('Discord username#0000 of the admin'),
});

const authLoginRequestSchema = object({
  username: string().required().regex(/[\w\s]+#[0-9]+/).description('Discord username#0000 of the admin'),
  token: number().greater(100000).less(999999).required(),
});


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
    email: user.email
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
 * Generates a token and stores it in the database
 * and triggers the bot to send the token to the user
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 */
export async function authTokenRequest(req: Request, res: Response, next: NextFunction) {

  try {
    const tokenRequest = authTokenRequestSchema.validate(req.body);
    if (tokenRequest.error) throw new ApiError(400, tokenRequest.error.message);

    // 1. check if user exits at the database
    const user = await Administrator.findOne({ 'userName': tokenRequest.value.username });
    if (!user) throw new ApiError(404, `User ${tokenRequest.value.username} not found`);

    // 2. Generate a new Token and save it in the database
    const tokenObj = {
      userId: user.userId,
      key: Math.floor(100000 + Math.random() * 900000)
    };
    const token = await (new AuthToken(tokenObj)).save();

    // 3. Send token to user
    sendTo(user.userId.toString(), new TokenRequestMessage(), { key: token.key });

    // 4. Done
    const response = new ApiSuccess();
    next(response);

  } catch (err) {
    loggerFile.error(err.message || err);
    next(err);
  }
}

/**
 * Generates a jwt if the user provides a valid username and token combination
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 */
export async function authLoginRequest(req: Request, res: Response, next: NextFunction) {
  try {
    // validate user input!
    const authRequest = authLoginRequestSchema.validate(req.body);
    if (authRequest.error) throw new ApiError(400, authRequest.error.message);

     // 1. check if user exists at the database
     const user = await Administrator.findOne({ 'userName': authRequest.value.username });
     if (!user) throw new ApiError(404, `User ${authRequest.value.username} not found`);

    // 2. find token in the database and compare the deposited discord user id
    const token = await AuthToken.findOneAndDelete({ key: authRequest.value.token, userId: user.userId });
    if (!token) throw new ApiError(401,  'Invalid token!');

    const response = new ApiSuccess(200, { 'accesstoken': generateJWToken(user) });
    next(response);

  } catch (err) {
    loggerFile.error(err.message || err);
    next(err);
  }
}

export function authVerify(req: Request, res: Response, next: NextFunction) {

  const response = new ApiSuccess(200);
  next(response);
}

export const isAuth = expressjwt({
  algorithms: ['HS256'],
  getToken: getTokenFromHeader,
  userProperty: 'token',
  secret: config.jwt.secret,
});
