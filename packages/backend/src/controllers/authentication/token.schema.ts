/* tslint:disable:ban-types */
import { Schema, model, Model, Document } from 'mongoose';

interface ITokenDocument extends Document {
  [_id: string]: any;
  key: String;
  createdAt: Date;
  userId: String;
}

const tokenSchema = new Schema({
  key: Number,
  createdAt: { type: Date, default: Date.now },
  userId: String,
});

export const Token: Model<ITokenDocument> = model<ITokenDocument>('Token', tokenSchema);
