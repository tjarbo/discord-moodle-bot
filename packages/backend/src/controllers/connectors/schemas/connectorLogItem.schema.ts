/* tslint:disable:ban-types */
import { Schema, model, Model, Document, Types } from 'mongoose';
import { config } from '../../../configuration/environment';
import { ConnectorLogType } from '..';

export interface IConnectorLogItemDocument extends Document {
  [_id: string]: any;
  connector: Types.ObjectId;
  createdAt: Date;
  message: string;
  type: ConnectorLogType;
}

const connectorLogItemSchema = new Schema({
  connector: { type: Schema.Types.ObjectId, ref: 'Connector', required: true },
  createdAt: { type: Date, default: Date.now, expires: config.connectorLogLifetime },
  message: { type: String, required: true },
  type: { type: String, required: true },
});

export const ConnectorLogItem: Model<IConnectorLogItemDocument> = model<IConnectorLogItemDocument>('connectorlog', connectorLogItemSchema);
