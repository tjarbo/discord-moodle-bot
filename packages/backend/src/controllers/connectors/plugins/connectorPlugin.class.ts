import { IConnectorDocument } from '../schemas/connector.schema';
import { IConnectorLogItemDocument } from '../schemas/connectorLogItem.schema';

export abstract class ConnectorPlugin {
  public abstract send(message: string): void;
  public abstract getLogs(limit: number): Promise<IConnectorLogItemDocument[]>;
  public abstract update(body: { [key: string]: any }): Promise<IConnectorDocument>;
  public abstract get objectId(): string;
  public abstract get courses(): { [key: string]: string; }[];
  public abstract get isDefault(): boolean;
}
