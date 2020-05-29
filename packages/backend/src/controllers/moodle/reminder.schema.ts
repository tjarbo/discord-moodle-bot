import { Schema, model, Model, Document } from 'mongoose';

interface IReminderSchema extends Document {
    [_id: string]: any;
    assignment_id: number;
}

const reminderSchema = new Schema({
    assignment_id: Number,
});

export const Reminder: Model<IReminderSchema> = model('Reminder', reminderSchema);
