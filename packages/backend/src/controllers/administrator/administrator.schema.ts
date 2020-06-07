/* tslint:disable:ban-types */
import { Schema, model, Model, Document } from 'mongoose';

export interface IAdministratorDocument extends Document {
  [_id: string]: any;
  userName: String;
  userId: String;
  createdAt: Date;
}

const administratorSchema = new Schema({
  userName: String,
  userId: String,
  createdAt: { type: Date, default: Date.now },
});

export const Administrator: Model<IAdministratorDocument> = model<IAdministratorDocument>('Administrator', administratorSchema);
