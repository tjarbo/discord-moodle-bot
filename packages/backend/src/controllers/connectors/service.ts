import { ApiError } from '../../utils/api';
import { loggerFile } from '../../configuration/logger';
import { ConnectorPlugin, ConnectorType, DiscordBotConnectorPlugin } from './plugins';
import { Connector, IConnectorDocument } from './schemas/connector.schema';
import { Message } from '../messages/templates';
import { config } from '../../configuration/environment';

class ConnectorService {

  private connectors: ConnectorPlugin[] = [];

  /**
   * Creates an instance of ConnectorService.
   * Fetches all connectors from database and creates ConnectorPlugin instances
   * @memberof ConnectorService
   */
  constructor() {
    loggerFile.info('ConnectorService has been started');
    // Get all connectors from Database
    Connector.find().then((connectorList: IConnectorDocument[]) => {
      connectorList.forEach(connector =>  {
        switch (connector.type) {
          case ConnectorType.Discord:
            loggerFile.debug(`Found connector of type Discord (${connector._id})`);
            this.connectors.push(new DiscordBotConnectorPlugin(connector));
            break;

          default:
            loggerFile.error(`Found connector with unknown type ${connector.type} at ${connector._id}`);
            break;
        }
      });

      // If no connector has been found, start to create connectors based on .env
      if (connectorList.length === 0) {
        loggerFile.warn('Not connector found at database');
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
      this.connectors.push(new DiscordBotConnectorPlugin(connector));
      loggerFile.debug(`Connector of type Discord (${connector._id}) has been created`);
    }
  }

  /**
   * Publish a message to connectors that have this course assigned
   * If the course is assigned to no course, it will send the message to all
   * connectors with the default flag.
   *
   * @param {string} moodleId objectId of MoodleInstance
   * @param {number} courseId id of the moodle course
   * @param {MessageTemplate} template message template that will be used
   * @param {*} options content that will be applied on template
   * @memberof ConnectorService
   */
  public publish(moodleId: string, courseId: string, template: Message, options: any): void {
    const message = template.apply(options);
    let messageWasSent: boolean = false;

    loggerFile.info('Got new message publish order');

    this.connectors.forEach(connector => {
      const course = connector.courses.find(element => element.moodleId === moodleId && element.courseId === courseId);
      if (course === undefined) return;

      messageWasSent = true;

      // Course is assigned to this connector, send message
      connector.send(message);
    });

    // If the message was sent to a plugin, stop here
    if (messageWasSent) return;

    loggerFile.info(`No connector for course ${courseId} of moodle ${moodleId} found. Use default connectors!`);

    // If not, send the message to all default connectors
    this.connectors.forEach(connector => {
      if (connector.isDefault) connector.send(message);
    });
  }

  /**
   * Updates a selected connector
   * Throws ApiError
   *
   * @param {string} connectorId objectId of the connector
   * @param {[key: string]: any} body body of http request
   * @returns {Promise<IConnectorDocument>} Updated document
   * @memberof ConnectorService
   */
  public async update(connectorId: string, body: { [key: string]: any }) : Promise<IConnectorDocument> {
    const connector = this.connectors.find(element => element.objectId === connectorId);
    if (!connector) throw new ApiError(404, `Connector with id ${connectorId} not found!`);

    return await connector.update(body);
  }
}

export const connectorService = new ConnectorService();
