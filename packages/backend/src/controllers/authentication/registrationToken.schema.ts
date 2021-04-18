/* tslint:disable:ban-types */
import { Schema, model, Model, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

interface IRegistrationTokenDocument extends Document {
  [_id: string]: any;
  key: string;
  createdAt: Date;
  userIsDeletable: boolean;
}

const registrationTokenSchema = new Schema({
  key: { type: String, default: uuidv4 },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '15m',
   },
   userIsDeletable: { type: Boolean, default: true },
});

export const RegistrationToken: Model<IRegistrationTokenDocument> = model<IRegistrationTokenDocument>('RegistrationToken', registrationTokenSchema);
