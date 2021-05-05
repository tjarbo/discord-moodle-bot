/* tslint:disable:ban-types */
import { Schema, model, Model, Document } from 'mongoose';
import { ConnectorType } from '../plugins';

export interface IConnectorDocument extends Document {
  [_id: string]: any;
  active: boolean;
  courses: { [key: string]: string }[];
  createdAt: Date;
  default: boolean;
  name: string;
  socket: any;
  type: ConnectorType;
}

const connectorSchema = new Schema({
  active: { type: Boolean, default: true },
  courses: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
  default: { type: Boolean, default: false },
  name: { type: String, required: true },
  socket: { type: Object },
  type: { type: ConnectorType },
});

export const Connector: Model<IConnectorDocument> = model<IConnectorDocument>('Connector', connectorSchema);
