/* tslint:disable:ban-types */
import { Schema, model, Model, Document } from 'mongoose';

export interface IAuthenticatorDocument extends Document {
  [_id: string]: any;
  credentialID: Buffer;
  credentialPublicKey: Buffer;
  counter: number;
  // ['usb' | 'ble' | 'nfc' | 'internal']
  transports?: AuthenticatorTransport[];
}

const authenticatorSchema = new Schema({
  credentialID: { type: Buffer, required: true },
  credentialPublicKey: { type: Buffer, required: true },
  counter: { type: Number, required: true },
  // ['usb' | 'ble' | 'nfc' | 'internal']
  transports: Array,
});

export const Authenticator: Model<IAuthenticatorDocument> = model<IAuthenticatorDocument>('Authenticator', authenticatorSchema);
