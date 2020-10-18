import { Schema, model, Model, Document } from 'mongoose';
import { loggerFile } from '../../../configuration/logger';
import { config } from '../../../configuration/environment';

type Timestamp = number;
type Milliseconds = number;

interface IMoodleSchema extends Document {
    [_id: string]: any;
    lastFetch: Timestamp;
    refreshRate: Milliseconds;
}

interface IModelMoodleSchema extends Model<IMoodleSchema> {
    getRefreshRate: () => Promise<Milliseconds>;
    getLastFetch: () => Promise<Timestamp>;
}

const moodleSchema = new Schema({
    // Note that Moodle stores its timestamps in seconds, not in ms!
    lastFetch: { type: Number, default: Math.floor(Date.now() / 1000)},
    refreshRate: { type: Number },
});

moodleSchema.statics.getRefreshRate = async () => {
    const moodle = await MoodleSettings.findOne();
    if (!moodle || !moodle.refreshRate) {
        loggerFile.error('MoodleSettings.getRefreshRate - could not find refresh rate, used .env values');
        return config.moodle.fetchInterval;
    }

    return moodle.refreshRate;
};

moodleSchema.statics.getLastFetch = async () => {
    const moodle = await MoodleSettings.findOne();
    if (!moodle || !moodle.lastFetch) {
        loggerFile.error('MoodleSettings.getLastFetch - could not find last fetch, used current time stamp');
        return Math.floor(Date.now() / 1000);
    }

    return moodle.lastFetch;
};
export const MoodleSettings: IModelMoodleSchema = model('Moodle', moodleSchema) as any;
