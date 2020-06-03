import { DiscordChannel } from './discordChannel.schema';
import { config } from '../../configuration/environment';
import { ApiError } from '../error/api.class';
import { loggerFile } from '../../configuration/logger';
import { Request, Response, NextFunction } from 'express';
import { object, string } from '@hapi/joi';

/**
 * Writes the discord channel into the database.
 * Uses the default config value if no value is given.
 * Creates a new document if it doesn't exist before.
 * @param channel {number} Discord channel.
 * @export
 */
export async function setDiscordChannel(channelNr:string = config.discordChannel):Promise<void>{
    await DiscordChannel.findOneAndUpdate({},{$set: {channel: channelNr}},{upsert: true});
}

/**
 * Returns the discord channel value from the database.
 * Creates a new document with the config value if it doesn't exist before.
 * @export
 * @returns {Promise<number>} A promise to the discord channel loaded from the database as string.
 */
export async function getDiscordChannel():Promise<string>{
    const result = await DiscordChannel.findOne();
    // Set default channel from config if theres nothing in the database
    if (!result) await setDiscordChannel();
    return result ? result.channel : config.discordChannel;
}

/**
 * Handles GET /api/settings/discordChannel requests and responds
 * with the current discord channel (as JSON Object).
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export async function getDiscordChannelRequest(req: Request, res: Response, next: NextFunction) {

    try {
        const channelId = await getDiscordChannel();
        if (!channelId) throw new ApiError(503, 'Internal error while retrieving discord channel id');
        res.status(200).json({channelId});

    }
    catch (err) {
        loggerFile.error(err.message);
        next(err);
    }
  }

// Schema for validating api input
const discordChannelRequestSchema = object({
    channelId: string().length(18).required()
});

/**
 * Handles PUT /api/settings/discordChannel/ requests.
 * Writes given string to the database.
 * @param req Request: Contains discord channel id as string
 * @param res Response
 * @param next NextFunction
 */
export async function setDiscordChannelRequest(req: Request, res: Response, next: NextFunction) {

    try {
        // Input checking
        const request = discordChannelRequestSchema.validate(req.body);
        if (request.error) throw new ApiError(400, request.error.message);

        // Method call and exit
        await setDiscordChannel(request.value.channelId);
        res.status(200).end();
    }
    catch (err) {
        loggerFile.error(err.message);
        next(err);
    }
  }
