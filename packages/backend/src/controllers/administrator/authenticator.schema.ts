/* tslint:disable:ban-types */
import { Schema, Document } from 'mongoose';

export interface IAuthenticatorDocument extends Document {
  [_id: string]: any;
  credentialID: Buffer;
  credentialPublicKey: Buffer;
  counter: number;
  transports?: AuthenticatorTransport[];
}

export const authenticatorSchema = new Schema({
  credentialID: { type: Buffer, required: true },
  credentialPublicKey: { type: Buffer, required: true },
  counter: { type: Number, required: true },
  transports: Array,
});
