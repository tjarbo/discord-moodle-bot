/**
 * Auth.js manages the user authentification for the REST-API
 */

import { Request, Response } from 'express';
import { object, string } from '@hapi/joi';
import { User, IUserDocument } from '../user/user.schema';
import { loggerFile } from '../../configuration/logger';
import { Token } from './token.schema';
import { client } from '../../configuration/discord';

const tokenReqeuestSchema = object({
  username: string().required(),
});

/**
 * Generates a token within the database
 * Triggers the bot to send the token to the user
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 */
export function authRequestToken(req: Request, res: Response) {
  const tokenReqeuest = tokenReqeuestSchema.validate(req.body);

  // TODO: Sicherheit erhöhen und weniger Informationen zurückschicken
  if (tokenReqeuest.error) res.status(400).json(tokenReqeuest);

  // 1. check if user exits at the database
  User.findOne({ 'userName': tokenReqeuest.value.username })
  .then((user: IUserDocument) => {
    if (!user) throw new Error(`authRequestToken(): Nutzer ${ tokenReqeuest.value.username } nicht gefunden`);

    // 2. Generate a new Token within the database
    const tokenObj = {
      userId: user.userId,
      key: Math.floor(100000 + Math.random() * 900000)
    };

    // 2. Generate a new Token and save it in the database
    new Token(tokenObj).save()
    .then((token) => {
      // 3. Send Token to user
      const discordUser = client.users.cache.get(user.userId.toString());
      discordUser.send(`:key: **Es wurde ein Zugangstoken angefordert**\n Zugangstoken lautet: ${token.key}\n`);
      discordUser.send(`Solltest du den Token nicht angefordert haben-Kein Problem, lösche diese Nachricht einfach`);
      res.status(200).end();
    });
  })
  .catch((err: Error) => {
    loggerFile.error(err.message);

    // TODO: Sicherheit erhöhen und weniger Informationen zurückschicken
    res.status(401).send(err);
  });
}

// export function authLogin(req: Request, res: Response) {

// }