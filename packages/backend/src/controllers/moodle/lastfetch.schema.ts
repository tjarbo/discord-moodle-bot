import { Schema, model, Model, Document } from 'mongoose';

interface ILastFetchSchema extends Document {
    [_id: string]: any;
    timestamp: number;
    name: string;
}

const lastFetchSchema = new Schema({
    timestamp: {type: Number, default: (Date.now() / 1000)},
});

export const LastFetch: Model<ILastFetchSchema> = model('LastFetch', lastFetchSchema);