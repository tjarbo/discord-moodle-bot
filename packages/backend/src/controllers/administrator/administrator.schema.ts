/* tslint:disable:ban-types */
import { Schema, model, Model, Document } from 'mongoose';
import { IAuthenticatorDocument } from '../authentication/authenticator.schema';

export interface IAdministratorDocument extends Document {
  [_id: string]: any;
  username: string;
  createdAt: Date;
  deletable: boolean;
  currentChallenge?: string;
  devices: IAuthenticatorDocument[];
}

const administratorSchema = new Schema({
  username: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  deletable: { type: Boolean, default: true },
  currentChallenge: { type: String, default: null },
  devices: [{ type: Schema.Types.ObjectId, ref: 'Authenticator' }],
});

export const Administrator: Model<IAdministratorDocument> = model<IAdministratorDocument>('Administrator', administratorSchema);
