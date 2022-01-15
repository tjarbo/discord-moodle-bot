/* tslint:disable:ban-types */
import { Schema, model, Model, Document } from 'mongoose';
import { IAuthenticatorDocument, authenticatorSchema } from './authenticator.schema';
import { string, alternatives } from 'joi';

export interface IAdministratorDocument extends Document {
  [_id: string]: any;
  username: string;
  createdAt: Date;
  deletable: boolean;
  currentChallenge?: string;
  device: IAuthenticatorDocument;
}

const administratorSchema = new Schema({
  username: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  deletable: { type: Boolean, default: true },
  currentChallenge: { type: String, default: null },
  device: { type: authenticatorSchema, default: null },
});

export const Administrator: Model<IAdministratorDocument> = model<IAdministratorDocument>('Administrator', administratorSchema);

export const administratorUsernameValidationSchema = alternatives().try(
  string().required().min(8).max(64).alphanum(),
  string().required().min(8).max(36).pattern(/^[\w\s]{3,32}#[0-9]{4}$/),
).required().description('Username of administrator');
