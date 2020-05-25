import { client } from '../../configuration/discord';
import { FMDBMessageTemplate } from './message.interface';
import { TextChannel } from 'discord.js';
import { config } from '../../configuration/environment';

/**
 * Send a templated message to a discord user
 *
 * @export
 * @param {string} userId Discord ID of the recipient
 * @param {FMDBMessageTemplate} messageTemplate Message template
 * @param {object} values
 */
export async function discordSendTo(userId: string, messageTemplate: FMDBMessageTemplate, values: object) {
  const discordUser = client.users.cache.get(userId);
  if (!discordUser) throw new Error(`User nicht im Discord Cache. Schreibe dem Bot eine kleine 'Test' Nachricht (per DM) und versuche es erneut.`);

  const message = messageTemplate.apply(values);
  if (!message) throw new Error('Internal server error');

  discordUser.send(message);
}

/**
 *  Publish a message to the set discord channel
 *
 * @export
 * @param {FMDBMessageTemplate} messageTemplate Message template
 * @param {object} value
 */
export async function discordPublish(messageTemplate: FMDBMessageTemplate, values: object) {
  const discordChannel = await client.channels.cache.get(config.discordChannel);
  if (!discordChannel) throw new Error(`Channel nicht im Discord Cache. Schreibe in dem Channel eine kleine 'Test' Nachricht und versuche es erneut.`);

  const message = messageTemplate.apply(values);
  if (!message) throw new Error('Internal server error');

  (discordChannel as TextChannel).send(message);
}