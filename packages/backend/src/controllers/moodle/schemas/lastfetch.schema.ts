import { Schema, model, Model, Document } from 'mongoose';

interface ILastFetchSchema extends Document {
    [_id: string]: any;
    timestamp: number;
}

const lastFetchSchema = new Schema({
    // Note that Moodle stores its timestamps in seconds, not in ms!
    timestamp: {type: Number, default: Math.floor(Date.now() / 1000)},
});

export const LastFetch: Model<ILastFetchSchema> = model('LastFetch', lastFetchSchema);
