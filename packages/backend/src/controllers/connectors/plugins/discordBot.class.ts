import Discord, { TextChannel } from 'discord.js';
import { IConnectorDocument } from '../schemas/connector.schema';
import { connectorLogger } from '../logger';
import { ConnectorPlugin } from './connectorPlugin.class';
import { object, ObjectSchema, string, ref, boolean, required } from '@hapi/joi';
import { ApiError } from '../../../utils/api';
import { LeanDocument } from 'mongoose';
import { Message } from '../../../controllers/messages/message.class';

export class DiscordBotConnectorPlugin extends ConnectorPlugin {
  private readonly client: Discord.Client = new Discord.Client();
  private isReady: boolean = false;

  private static readonly socketSchema: ObjectSchema = object({
      channel: string().alphanum().length(18).when(ref('$isRequired'), {
        is: boolean().invalid(false),
        then: required()
      }),
      token: string().when(ref('$isRequired'), {
        is: boolean().invalid(false),
        then: required()
      }),
  }).required();

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
   * Validates a given object if it is a valid socket for discord bot.
   * * Throws Error if validation failed
   *
   * @static
   * @throws Error
   * @param {unknown} unknownSocket untrusted socket object
   * @param {boolean} isRequired set attributes of socket as required
   * @return {*} Validated socket object with optional missing parameters
   * @memberof DiscordBotConnectorPlugin
   */
  public static validateSocket(unknownSocket: unknown, isRequired: boolean): any {
    const validation = this.socketSchema.validate(unknownSocket, { context: { isRequired }});
    if (validation.error) throw new Error(validation.error.message);

    return validation.value;
  }

  /**
   * Sends the given message to the discord channel
   *
   * @param {string} message to send
   */
  public send(message: Message): void {

    if (!this.isReady) return connectorLogger.error(`Discord Bot not ready! Unable to send message.`, this.objectId);

    const discordChannel = this.client.channels.cache.get(this.document.socket.channel);
    if (!discordChannel) return connectorLogger.error(`Channel not in discord cache. Send a small 'test' message to the channel and try again.`, this.objectId);

    (discordChannel as TextChannel).send(message.Markdown)
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
    try {
      // Validate missing part of user input validation
      const socket = DiscordBotConnectorPlugin.validateSocket(patch.socket, false);

      // Do not delete attributes of socket caused by REST PUT method
      Object.assign(this.document.socket, socket);
      delete patch.socket;

    } catch (error) {
      // Validation failed -> throw ApiError
      throw new ApiError(400, error);
    }

    // Apply changes
    this.document.set(patch);

    // Mark socket as modified, even not, because nested changes will not recognized
    this.document.markModified('socket');

    // Save changes
    await this.document.save();

    // Log update process
    connectorLogger.info('New values have been applied', this.objectId);

    this.setupClient();

    return this.Document;
  }

  /**
   * Destroys the connector and deletes the document from the database
   *
   * @return {*}  {Promise<Readonly<LeanDocument<IConnectorDocument>>>}
   * @memberof DiscordBotConnectorPlugin
   */
  public async destroy(): Promise<Readonly<LeanDocument<IConnectorDocument>>> {
    this.isReady = false;
    this.client.destroy();

    await this.document.delete();

    return this.Document;
  }

  get Document() {
    const doc = this.document.toObject();

    // Hide sensitive information
    doc.socket.token = 'hidden';

    return Object.freeze(doc);
  }
}
