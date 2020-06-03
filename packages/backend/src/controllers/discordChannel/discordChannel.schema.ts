import { Schema, model, Model, Document } from 'mongoose';

interface IDiscordChannelSchema extends Document {
    [_id: string]: any;
    channel: string;
}

const discordChannelSchema = new Schema({
    channel: {type: String},
});

export const DiscordChannel: Model<IDiscordChannelSchema> = model('DiscordChannel', discordChannelSchema);
