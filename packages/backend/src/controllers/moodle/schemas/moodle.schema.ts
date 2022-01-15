import { Schema, model, Model, Document } from 'mongoose';
import { loggerFile } from '../../../configuration/logger';
import { config } from '../../../configuration/environment';

type Timestamp = number;
type Milliseconds = number;

interface IMoodleSchema extends Document {
  [_id: string]: any;
  lastFetch: Timestamp;
  refreshRate: Milliseconds;
  nextFetch: Timestamp;
}

interface IModelMoodleSchema extends Model<IMoodleSchema> {
  getRefreshRate: () => Promise<Milliseconds>;
  getLastFetch: () => Promise<Timestamp>;
  getNextFetch: () => Promise<Timestamp>;
}

const moodleSchema = new Schema({
  // Note that Moodle stores its timestamps in seconds, not in ms!
  lastFetch: { type: Number, default: 0 },
  refreshRate: { type: Number, default: 900000 },
  nextFetch: { type: Number, default: 0 },
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
    loggerFile.error('MoodleSettings.getLastFetch - could not find last fetch value, returned 0');
    return 0;
  }

  return moodle.lastFetch;
};

moodleSchema.statics.getNextFetch = async () => {
  const moodle = await MoodleSettings.findOne();
  if (!moodle || !moodle.nextFetch) {
    loggerFile.error('MoodleSettings.getNextFetch - could not find next fetch value, returned 0');
    return 0;
  }

  return moodle.nextFetch;
};
export const MoodleSettings: IModelMoodleSchema = model('moodlesetting', moodleSchema) as any;
