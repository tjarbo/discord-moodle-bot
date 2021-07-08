import Discord, { TextChannel } from 'discord.js';
import { IConnectorDocument } from '../schemas/connector.schema';
import { connectorLogger } from '../logger';
import { ConnectorPlugin } from './connectorPlugin.class';
import { object, ObjectSchema, string } from '@hapi/joi';
import { ApiError } from '../../../utils/api';
import { LeanDocument } from 'mongoose';

export class DiscordBotConnectorPlugin extends ConnectorPlugin {
  private readonly client: Discord.Client = new Discord.Client();
  private readonly updateRequestSchema: ObjectSchema = object({
    socket: object({
      channel: string().alphanum().length(18),
      token: string(),
    }),
  }).unknown().required();
  private isReady: boolean = false;

  /**
   * Creates an instance of DiscordBotConnectorPlugin.
   *
   * @param {IConnectorDocument} document mongoose document
   * @memberof DiscordBotConnectorPlugin
   */
  constructor(protected document: IConnectorDocument) {
    super();
    this.setupClient();
  }

  /**
   * Set up the discord client with the token provided by the document.
   * Can be called after a document update as well.
   *
   * @private
   * @return {*} {Promise<void>}
   * @memberof DiscordBotConnectorPlugin
   */
  private async setupClient(): Promise<void> {
    this.isReady = false;
    this.client.destroy();

    this.setUpListeners();

    try {
      await this.client.login(this.document.socket.token);
      this.isReady = true;
      connectorLogger.info(`Logged in as ${this.client.user.tag}!`, this.objectId);
    } catch (error) {
      connectorLogger.error(error.message, this.objectId);
    }
  }

  /**
   * Creates all listeners to provide better overview about the health of the bot.
   *
   * @private
   * @memberof DiscordBotConnectorPlugin
   */
  private setUpListeners(): void {
    this.client.on('ready', () => { this.isReady = true; });

    this.client.on('warn', (info) => {
      connectorLogger.warn(`discord.js: ${info}`, this.objectId);
    });

    this.client.on('disconnect', (info) => {
      this.isReady = false;
      connectorLogger.error(`discord.js: ${info}`, this.objectId);
    });
  }

  /**
   * Sends the given message to the discord channel
   *
   * @param {string} message to send
   */
  public send(message: string): void {

    if (!this.isReady) return connectorLogger.error(`Discord Bot not ready! Unable to send message.`, this.objectId);

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
   * @param {{ [key: string]: any }} patch (user input) validated update data
   * @return {Promise<IConnectorDocument>} The updated document
   * @memberof DiscordBotConnectorPlugin
   */
  public async update(patch: { [key: string]: any }): Promise<Readonly<LeanDocument<IConnectorDocument>>> {
    // Validate user input
    const updateRequest = this.updateRequestSchema.validate(patch);
    if (updateRequest.error) throw new ApiError(400, updateRequest.error.message);

    // Do not delete attributes of socket caused by REST PUT method
    Object.assign(this.document.socket, updateRequest.value.socket);
    delete updateRequest.value.socket;

    // Apply changes
    this.document.set(updateRequest.value);
    this.document.save();

    // Log update process
    connectorLogger.info('New values have been applied', this.objectId);

    this.setupClient();

    return this.Document;
  }

  get Document() {
    const doc = this.document.toObject();

    // Hide sensitive information
    doc.socket.token = 'hidden';

    return Object.freeze(doc);
  }
}
