/* tslint:disable:ban-types */
import { Schema, model, Model, Document } from 'mongoose';

interface IAuthTokenDocument extends Document {
  [_id: string]: any;
  key: String;
  createdAt: Date;
  userId: String;
}

const authTokenSchema = new Schema({
  key: Number,
  createdAt: { type: Date, default: Date.now },
  userId: String,
});

export const AuthToken: Model<IAuthTokenDocument> = model<IAuthTokenDocument>('AuthToken', authTokenSchema);
