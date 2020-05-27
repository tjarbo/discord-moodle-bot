/* tslint:disable:ban-types */
import { Schema, model, Model, Document } from 'mongoose';

export interface IUserDocument extends Document {
  [_id: string]: any;
  userName: String;
  userId: String;
  createdAt: Date;
}

const userSchema = new Schema({
  userName: String,
  userId: String,
  createdAt: { type: Date, default: Date.now },
});

export const User: Model<IUserDocument> = model<IUserDocument>('User', userSchema);
