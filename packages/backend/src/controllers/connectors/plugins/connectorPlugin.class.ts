import { LeanDocument } from 'mongoose';
import { Message } from '../../../controllers/messages/message.class';
import { IConnectorDocument } from '../schemas/connector.schema';
import { ConnectorLogItem, IConnectorLogItemDocument } from '../schemas/connectorLogItem.schema';

export abstract class ConnectorPlugin {

  protected abstract document: IConnectorDocument;

  public abstract send(message: Message): void;
  public abstract destroy(): Promise<Readonly<LeanDocument<IConnectorDocument>>>;
  public abstract update(body: { [key: string]: any }): Promise<Readonly<LeanDocument<IConnectorDocument>>>;
  public abstract get Document(): Readonly<LeanDocument<IConnectorDocument>>


  /**
   * Returns an array of the newest log items of this connector.
   * The amount of items can be limited by parameter. Default is 50.
   *
   * @param {number} [limit=50] Set a limit to the amount of items
   * @return {Promise<IConnectorLogItemDocument[]>} Array of ConnectorLogItemDocuments
   * @memberof ConnectorPlugin
   */
  public async getLogs(limit: number = 50): Promise<IConnectorLogItemDocument[]> {
    const query = {
      connector: this.objectId
    };
    return await ConnectorLogItem.find(query).sort({ createdAt: -1 }).limit(limit);
  }

  /**
   * Returns the mongoDB objectId, this connector is build on.
   *
   * @readonly
   * @type {string}
   * @memberof ConnectorPlugin
   */
  public get objectId(): string { return this.document.id; }

  /**
   * Returns all courses, that are assigned to this bot.
   *
   * @readonly
   * @type {{ [key: string]: string; }[]}
   * @memberof ConnectorPlugin
   */
  public get courses(): number[] {
    return this.document.courses;
  }

  /**
   * Returns true, if this plugin is active.
   *
   * @readonly
   * @type {boolean}
   * @memberof ConnectorPlugin
   */
  public get isActive(): boolean {
    return this.document.active;
  }

  /**
   * Returns true, if this plugin is an default handler for not
   * assigned courses.
   *
   * @readonly
   * @type {boolean}
   * @memberof ConnectorPlugin
   */
  public get isDefault(): boolean {
    return this.document.default;
  }
}
