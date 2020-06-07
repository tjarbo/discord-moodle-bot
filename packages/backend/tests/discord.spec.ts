import { client } from '../src/configuration/discord';
import { TokenRequestMessage } from '../src/controllers/discord/templates';
import { publish, sendTo } from '../src/controllers/discord';
import { ApiError } from '../src/controllers/error/api.class';
import * as discordChannel from '../src/controllers/discordChannel/discordChannel';

jest.mock('../src/configuration/environment.ts');
jest.mock('../src/configuration/discord.ts');

describe('discord.ts discordSendTo', () => {
  let spyDiscordClientUsers: jest.SpyInstance;

  beforeEach(() => {
    spyDiscordClientUsers = jest.spyOn(client.users.cache, 'get');
  });

  it('should throw error if user is not in cache', async () => {
    spyDiscordClientUsers.mockImplementation(() => null);
    const compareError = new ApiError(409, `User not in discord cache. Send the bot a small 'test' message (via DM) and try again.`);
    try {
      await sendTo('1234657890', new TokenRequestMessage(), { key: 123123 });
    } catch (error) {
      expect(error).toEqual(compareError);
    }
  });

  it('should send message if everything is fine', async () => {
    const mockDiscordUser = { send: jest.fn() };
    spyDiscordClientUsers.mockImplementation(() => mockDiscordUser);

    await sendTo('1234657890', new TokenRequestMessage(), { key: 123123 });
    expect(mockDiscordUser.send).toHaveBeenCalled();
  });

});

describe('discord.ts discordPublish', () => {
  let spyDiscordClientChannels: jest.SpyInstance;
  let spyDiscordChannel: jest.SpyInstance;

  beforeEach(() => {
    spyDiscordClientChannels = jest.spyOn(client.channels.cache, 'get');
    spyDiscordChannel = jest.spyOn(discordChannel, 'getDiscordChannel');
  });

  it('should throw error if channel is not in cache', async () => {
    spyDiscordClientChannels.mockImplementation(() => null);
    spyDiscordChannel.mockImplementation(() => null);
    const compareError = new Error(`Channel not in discord cache. Send a small 'test' message to the channel and try again.`);
    try {
      await publish(new TokenRequestMessage(), { key: 123123 });
    } catch (error) {
      expect(error).toEqual(compareError);
    }
  });

  it('should send message if everything is fine', async () => {
    const mockDiscordChannel = { send: jest.fn() };
    spyDiscordClientChannels.mockImplementation(() => mockDiscordChannel);
    spyDiscordChannel.mockResolvedValue(() => 123123123);

    await publish(new TokenRequestMessage(), { key: 123123 });
    expect(mockDiscordChannel.send).toHaveBeenCalled();
  });

});
