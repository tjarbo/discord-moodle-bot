/* tslint:disable:ban-types */
import { config } from '../../configuration/environment';
import { Schema, model, Model, Document } from 'mongoose';
import { v4 as uuidv4, validate as validateUUID } from 'uuid';
import { string, CustomHelpers, ErrorReport } from 'joi';

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
    expires: config.registrationTokenLifetime,
  },
  userIsDeletable: { type: Boolean, default: true },
});

export const RegistrationToken: Model<IRegistrationTokenDocument> = model<IRegistrationTokenDocument>('RegistrationToken', registrationTokenSchema);

const isUUID = (value: string, helper: CustomHelpers): string | ErrorReport => {
  if (!validateUUID(value)) return helper.error('any.invalid');
  return value;
};

export const registrationTokenValidationSchema = string().required().custom(isUUID).description('Registration token');
