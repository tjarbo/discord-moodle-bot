/**
 * Auth.js manages the user authentification for the REST-API
 */

import { Request, Response, NextFunction } from 'express';
import { object, string, number } from '@hapi/joi';
import { User, IUserDocument } from '../user/user.schema';
import { loggerFile } from '../../configuration/logger';
import { AuthToken } from './token.schema';
import { client } from '../../configuration/discord';
import jwt from 'jsonwebtoken';
import expressjwt from 'express-jwt';
import { config } from '../../configuration/environment';
import { ApiError } from '../error/api.class';

const tokenReqeuestSchema = object({
  username: string().required(),
});

const authRequestSchema = object({
  username: string().required(),
  tokenKey: number().greater(100000).less(999999),
});


/**
 * Generates a signed jwt token, which conatins the user 
 * object
 * 
 * @param {IUserDocument} user
 * @returns jwt
 */
function generateJWToken(user: IUserDocument) {
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
export async function authRequestToken(req: Request, res: Response, next: NextFunction) {

  try {
    const tokenRequest = tokenReqeuestSchema.validate(req.body);
    if (tokenRequest.error) throw new ApiError(400, tokenRequest.error.message)

    // 1. check if user exits at the database
    const user = await User.findOne({ 'userName': tokenRequest.value.username })
    console.log("######asdasdasdasda'#######");
    
    if (!user) throw new ApiError(404 ,`Nutzer ${tokenRequest.value.username} nicht gefunden`);
    console.log("%%%%%%%%%%%%werwerewr%%%%%%%%");
    
    // 2. Generate a new Token and save it in the database
    const tokenObj = {
      userId: user.userId,
      key: Math.floor(100000 + Math.random() * 900000)
    };
    const token = await (new AuthToken(tokenObj)).save()

    // 3. Send token to user
    const discordUser = client.users.cache.get(user.userId.toString());
    if (!discordUser) throw new ApiError(409, `${tokenRequest.value.username} nicht im Discord Cache. Schreibe dem Bot eine kleine 'Test' Nachricht (per DM) und versuche es erneut.`);

    discordUser.send(`:key: **Es wurde ein Zugangstoken angefordert**\n Zugangstoken lautet: ${token.key}\n`);
    discordUser.send(`Solltest du den Token nicht angefordert haben-Kein Problem, lösche diese Nachricht einfach`);
    
    // 4. Done
    res.status(200).end();

  } catch (err) {
    loggerFile.error(err.message);
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
export function authLogin(req: Request, res: Response) {

  // validate user input!
  const authRequest = authRequestSchema.validate(req.body);
  if (!!authRequest.error) {
    res.status(400).send(authRequest.error.message);
    return;
  }

  // Find user in the 'admin' collection
  User.findOne({ userName: authRequest.value.username })
    .then((user) => {
      if (!user) {
        res.status(404).send('User not found');
        return;
      }
      // Find token in the datase and compare the deposited discord user id
      AuthToken.findOne({ key: authRequest.value.tokenKey })
        .then((token) => {
          if (token && user.userId === token.userId) {
            res.status(200).json({ 'accesstoken': generateJWToken(user) });
          } else {
            res.status(401).send('Invalid token');
            return;
          }
        });
    })
    .catch((err: Error) => {
      loggerFile.error(err.message);
      res.status(500).end();
    });
}

export const isAuth = expressjwt({
  secret: config.jwt.secret,
  userProperty: 'token',
  getToken: getTokenFromHeader,
});
