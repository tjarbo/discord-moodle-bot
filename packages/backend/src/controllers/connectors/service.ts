import { ApiError } from '../../utils/api';
import { loggerFile } from '../../configuration/logger';
import { ConnectorPlugin, ConnectorType, DiscordBotConnectorPlugin } from './plugins';
import { Connector, IConnectorDocument } from './schemas/connector.schema';
import { Message } from '../messages/templates';
import { config } from '../../configuration/environment';
import { LeanDocument } from 'mongoose';

class ConnectorService {

  #connectors: ConnectorPlugin[] = [];

  /**
   * Creates an instance of ConnectorService.
   * Fetches all connectors from database and creates ConnectorPlugin instances
   * @memberof ConnectorService
   */
  constructor() {
    loggerFile.info('ConnectorService has been started');
    // Get all connectors from database
    Connector.find().then((connectorList: IConnectorDocument[]) => {
      connectorList.forEach(connector =>  {
        switch (connector.type) {
          case ConnectorType.Discord:
            loggerFile.debug(`Found connector of type Discord Bot (${connector._id})`);
            this.#connectors.push(new DiscordBotConnectorPlugin(connector));
            break;

          default:
            loggerFile.error(`Found connector with unknown type ${connector.type} at ${connector._id}`);
            break;
        }
      });

      // If no connector has been found, start to create connectors based on .env
      if (connectorList.length === 0) {
        loggerFile.warn('No connector found within database');
        this.createConnectorsFromEnv();
      }
    });
  }

  /**
   * Creates new connectors based on environment variables
   *
   * @private
   * @async
   * @memberof ConnectorService
   */
  private async createConnectorsFromEnv(): Promise<void> {
    loggerFile.debug('Start creating connectors from environment variables');

    // Create optional discord Bot
    if (!!config.discordChannel && !!config.discordToken) {

      try {
        const socket = {
          channel: config.discordChannel,
          token: config.discordToken,
        };

        this.create('Discord Bot (Environment)', ConnectorType.Discord, socket);
      } catch (error) {
        let { message } = error;
        if (error instanceof ApiError) message = error.error;

        loggerFile.error(`Failed to create Discord bot from .env! Reason(s): ${ message }`);
      }
    }
  }

  /**
   * Returns connector from internal array with given id
   * Throws error if connector does not exist
   *
   * @private
   * @throws Error
   * @param {string} id objectId of the wanted connector
   * @return {ConnectorPlugin}  {*}
   * @memberof ConnectorService
   */
  private findConnectorWith(id: string): ConnectorPlugin {
    const connector = this.#connectors.find(element => element.objectId === id);
    if (!connector) throw new Error(`Connector with id ${id} not found!`);

    return connector;
  }

  /**
   * Publish a message to connectors that have this course assigned
   * If the course is not assigned to a connector, it will send the message to all
   * connectors with the default flag.
   *
   * @param {number} courseId id of the moodle course
   * @param {MessageTemplate} template message template that will be used
   * @memberof ConnectorService
   */
  public publish(courseId: number, message: Message): void {
    let messageWasSent: boolean = false;

    loggerFile.info('Got new message publish order');

    this.#connectors.forEach(connector => {
      // Check if connector is active and course is assigned to this connector - skip if not
      if (!connector.isActive || connector.courses.indexOf(courseId) === -1) return;

      messageWasSent = true;

      // Course is assigned to this connector, send message
      connector.send(message);
    });

    // If the message was sent to a plugin, stop here
    if (messageWasSent) return;

    loggerFile.info(`No connector for course ${courseId} found. Use default connectors!`);

    // If not, send the message to all default connectors
    this.#connectors.forEach(connector => {
      if (connector.isDefault && connector.isActive) connector.send(message);
    });
  }

  /**
   * Creates a new connector and saves it to database.
   * Use only with validated user input (except socket)!
   *
   * @param {string} name Name of the new connector
   * @param {ConnectorType} type Type of the new connector
   * @param {*} untrustedSocket Socket of the new connector
   * @return {Promise<Readonly<LeanDocument<IConnectorDocument>>>} Created connector
   * @memberof ConnectorService
   */
  public async create(name: string, type: ConnectorType, untrustedSocket: any) : Promise<Readonly<LeanDocument<IConnectorDocument>>> {

    // 1. Prepare document
    let options: IConnectorDocument = {
      name,
      type,
      default: true,
    } as IConnectorDocument;

    let plugin: ConnectorPlugin;

    switch (type) {
      case ConnectorType.Discord:
        try {
          // 2. Validate socket
          const socket = DiscordBotConnectorPlugin.validateSocket(untrustedSocket, true);

          // 3. Extend document
          options = {
            ...options,
            socket,
          } as IConnectorDocument;

        } catch (error) {
          // Validation failed -> throw ApiError
          throw new ApiError(400, error.message);
        }

        // 4. Add connector to database
        const connector = await new Connector(options).save();
        plugin = new DiscordBotConnectorPlugin(connector);

        // 5. Add connector to service
        this.#connectors.push(plugin);
        loggerFile.debug(`Connector of type Discord (${connector._id}) has been created`);
        break;

      default:
        throw new ApiError(404, 'Unknown connector type!');
    }

    return plugin.Document;
  }

  /**
   * Updates a selected connector
   *
   * @throws ApiError
   * @param {string} id objectId of the connector
   * @param {[key: string]: any} body body of http request - socket not validated!
   * @returns {Promise<IConnectorDocument>} Updated document
   * @memberof ConnectorService
   */
  public update(id: string, body: { [key: string]: any }) : Promise<Readonly<LeanDocument<IConnectorDocument>>> {

    let connector;

    try {
      connector = this.findConnectorWith(id);
    } catch (error) {
      throw new ApiError(404, error.message);
    }

    return connector.update(body);
  }

  /**
   * Deletes a connector with given id
   *
   * @async
   * @throws ApiError
   * @param {string} id objectId of the connector
   * @returns {Promise<IConnectorDocument>} Delete connector document
   * @memberof ConnectorService
   */
  public async delete(id: string) : Promise<Readonly<LeanDocument<IConnectorDocument>>> {

    let connector;

    try {
      connector = this.findConnectorWith(id);
    } catch (error) {
      throw new ApiError(404, error.message);
    }
    await connector.destroy();
    this.#connectors.splice(this.#connectors.indexOf(connector), 1);

    return connector.Document;
  }

  /**
   * Returns an status array that contains
   * 1. the amount of connectors
   * 2. the amount of active connectors
   * 3. the amount of default connectors
   *
   * @type {Readonly<[number, number, number]>} status array
   * @memberof ConnectorService
   */
  get status(): [number, number, number] {
    const connectorsLength = this.#connectors.length;
    const connectorsActiveLength = this.#connectors.filter(con => con.isActive).length;
    const connectorsDefaultLength = this.#connectors.filter(con => con.isDefault).length;

    return [
      connectorsLength,
      connectorsActiveLength,
      connectorsDefaultLength
    ];
  }

  /**
   * Returns an array of readonly documents of all connectors
   *
   * @readonly
   * @type {Readonly<LeanDocument<IConnectorDocument>>[]}
   * @memberof ConnectorService
   */
  get connectors() : Readonly<LeanDocument<IConnectorDocument>>[] {
    const result: Readonly<LeanDocument<IConnectorDocument>>[]  = [];
    this.#connectors.forEach(connector => result.push(connector.Document));
    return result;
  }
}

export const connectorService = new ConnectorService();
