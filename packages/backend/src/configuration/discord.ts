import Discord from 'discord.js';
import { config } from './environment';
import { loggerFile } from './logger';

export const client = new Discord.Client();

client.once('ready', () => {
    loggerFile.info(`Logged in as ${client.user.tag}!`);
  });

client.login(config.discordToken);