import { Schema, model, Model, Document } from 'mongoose';

interface IRefreshRateSchema extends Document {
    [_id: string]: any;
    milliseconds: number;
}

const refreshRateSchema = new Schema({
    milliseconds: {type: Number},
});

export const RefreshRate: Model<IRefreshRateSchema> = model('RefreshRate', refreshRateSchema);
