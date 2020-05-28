/**
 * discord.js provides an interface to interact with the discord.js libary on an easy way.
 */
import { client } from '../../configuration/discord';
import { FMDBMessageTemplate } from './message.interface';
import { TextChannel } from 'discord.js';
import { config } from '../../configuration/environment';
import { ApiError } from '../error/api.class';

/**
 * Send a templated message to a discord user
 *
 * @export
 * @param {string} userId Discord ID of the recipient
 * @param {FMDBMessageTemplate} messageTemplate Message template
 * @param {object} values
 */
export async function sendTo(userId: string, messageTemplate: FMDBMessageTemplate, values: object) {
  const discordUser = client.users.cache.get(userId);
  if (!discordUser) throw new ApiError(409, `User not in discord cache. Send the bot a small 'test' message (via DM) and try again.`);

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
export async function publish(messageTemplate: FMDBMessageTemplate, values: object) {
  const discordChannel = await client.channels.cache.get(config.discordChannel);
  if (!discordChannel) throw new Error(`Channel not in discord cache. Send a small 'test' message to the channel and try again.`);

  const message = messageTemplate.apply(values);
  if (!message) throw new Error('Internal server error');

  (discordChannel as TextChannel).send(message);
}
