/* tslint:disable:ban-types */
import { Schema, model, Model, Document } from 'mongoose';
import { config } from '../../../configuration/environment';
import { ConnectorLogType } from '..';
import { ConnectorType } from '../plugins';

export interface IConnectorLogItemDocument extends Document {
  [_id: string]: any;
  connector: string;
  createdAt: Date;
  message: string;
  type: ConnectorType;
}

const connectorLogItemSchema = new Schema({
  connector: { type: Schema.Types.ObjectId, ref: 'Connector', required: true },
  createdAt: { type: Date, default: Date.now, expires: config.connectorLogLifetime, },
  message: { type: String, required: true },
  type: { type: ConnectorLogType, required: true },
});

export const ConnectorLogItem: Model<IConnectorLogItemDocument> = model<IConnectorLogItemDocument>('connectorlog', connectorLogItemSchema);
