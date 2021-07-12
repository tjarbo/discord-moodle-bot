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
      const options: IConnectorDocument = {
        name: 'Discord Bot (Environment)',
        type: ConnectorType.Discord,
        default: true,
        socket: {
          channel: config.discordChannel,
          token: config.discordToken,
        },
      } as IConnectorDocument;

      const connector = await new Connector(options).save();
      this.#connectors.push(new DiscordBotConnectorPlugin(connector));
      loggerFile.debug(`Connector of type Discord (${connector._id}) has been created`);
    }
  }

  /**
   * Publish a message to connectors that have this course assigned
   * If the course is not assigned to a connector, it will send the message to all
   * connectors with the default flag.
   *
   * @param {number} courseId id of the moodle course
   * @param {MessageTemplate} template message template that will be used
   * @param {*} options content that will be applied on template
   * @memberof ConnectorService
   */
  public publish(courseId: number, template: Message, options: any): void {
    const message = template.apply(options);
    let messageWasSent: boolean = false;

    loggerFile.info('Got new message publish order');

    this.#connectors.forEach(connector => {
      // See if course is assigned to this connector - skip if not
      if (connector.courses.indexOf(courseId) === -1) return;

      messageWasSent = true;

      // Course is assigned to this connector, send message
      connector.send(message);
    });

    // If the message was sent to a plugin, stop here
    if (messageWasSent) return;

    loggerFile.info(`No connector for course ${courseId} found. Use default connectors!`);

    // If not, send the message to all default connectors
    this.#connectors.forEach(connector => {
      if (connector.isDefault) connector.send(message);
    });
  }

  /**
   * Updates a selected connector
   *
   * @throws ApiError
   * @param {string} connectorId objectId of the connector
   * @param {[key: string]: any} body body of http request
   * @returns {Promise<IConnectorDocument>} Updated document
   * @memberof ConnectorService
   */
  public update(connectorId: string, body: { [key: string]: any }) : Promise<Readonly<LeanDocument<IConnectorDocument>>> {
    const connector = this.#connectors.find(element => element.objectId === connectorId);
    if (!connector) throw new ApiError(404, `Connector with id ${connectorId} not found!`);

    return connector.update(body);
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
