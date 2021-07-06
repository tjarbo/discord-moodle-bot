import Discord, { TextChannel } from 'discord.js';
import { config } from '../../../configuration/environment';
import { IConnectorDocument } from '../schemas/connector.schema';
import { connectorLogger } from '../logger';
import { ConnectorPlugin } from './connectorPlugin.class';
import { object, ObjectSchema, string } from '@hapi/joi';
import { ApiError } from '../../../utils/api';

export class DiscordBotConnectorPlugin extends ConnectorPlugin {
  private readonly client: Discord.Client = new Discord.Client();
  private readonly updateRequestSchema: ObjectSchema = object({
    channel: string().alphanum().length(18),
  }).required();

  /**
   * Creates an instance of DiscordBotConnectorPlugin.
   *
   * @param {IConnectorDocument} document mongoose document
   * @memberof DiscordBotConnectorPlugin
   */
  constructor(protected document: IConnectorDocument) {
    super();

    this.setUpListeners();
    this.client.login(config.discordToken);
  }

  /**
   * Creates all listeners to provide better overview about the health of the bot.
   *
   * @private
   * @memberof DiscordBotConnectorPlugin
   */
  private setUpListeners(): void {
    this.client.once('ready', () => {
      connectorLogger.info(`Logged in as ${this.client.user.tag}!`, this.objectId);
    });

    this.client.on('warn', (info) => {
      connectorLogger.warn(`discord.js: ${info}`, this.objectId);
    });

    this.client.on('disconnect', (info) => {
      connectorLogger.error(`discord.js: ${info}`, this.objectId);
    });
  }

  /**
   * Sends the given message to the discord channel
   *
   * @param {string} message to send
   */
  public send(message: string): void {
    const discordChannel = this.client.channels.cache.get(this.document.socket.channel);
    if (!discordChannel) return connectorLogger.error(`Channel not in discord cache. Send a small 'test' message to the channel and try again.`, this.objectId);

    (discordChannel as TextChannel).send(message)
      .then(() => {
        connectorLogger.info('Successfully sent message via Discord bot!', this.objectId);
      })
      .catch((error) => {
        connectorLogger.info(`Failed to send message via Discord bot! ${error.message}`, this.objectId);
      });
  }

  /**
   * Applies the given patch to the discord bot document.
   *
   * @param {{ [key: string]: any }} body
   * @return {Promise<IConnectorDocument>} The updated document
   * @memberof DiscordBotConnectorPlugin
   */
  public async update(body: { [key: string]: any }): Promise<IConnectorDocument> {
    // Validate user input
    const updateRequest = this.updateRequestSchema.validate(body);
    if (updateRequest.error) throw new ApiError(400, updateRequest.error.message);

    // Apply changes
    this.document.socket.channel = updateRequest.value.channel;
    const result  = await this.document.save();

    // Log update process
    connectorLogger.info('New values have been applied', this.objectId);

    return result;
  }

  get Document() {
    const doc = this.document.toObject();

    // Hide sensitive information
    doc.socket.token = 'hidden';

    return Object.freeze(doc);
  }
}
