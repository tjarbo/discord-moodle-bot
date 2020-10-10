import { Schema, model, Model, Document } from 'mongoose';

type Timestamp = number;
type Milliseconds = number;

interface IMoodleSchema extends Document {
    [_id: string]: any;
    lastFetch: Timestamp;
    refreshRate: Milliseconds;
}

const moodleSchema = new Schema({
    // Note that Moodle stores its timestamps in seconds, not in ms!
    lastFetch: { type: Number, default: Math.floor(Date.now() / 1000)},
    refreshRate: { type: Number },
});

export const MoodleSettings: Model<IMoodleSchema> = model('Moodle', moodleSchema);