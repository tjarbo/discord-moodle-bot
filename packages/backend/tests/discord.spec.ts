import { client } from '../src/configuration/discord';
import { TokenRequestMessage } from '../src/controllers/discord/templates/tokenMessage.class';
import { discordPublish, discordSendTo } from '../src/controllers/discord/discord';
import { ApiError } from '../src/controllers/error/api.class';

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
      await discordSendTo('BalBalBlub', new TokenRequestMessage(), { key: 123123 });
    } catch (error) {
      expect(error).toEqual(compareError);
    }
  });

  it('should send message if everything is fine', async () => {
    const mockDiscordUser = { send: jest.fn() };
    spyDiscordClientUsers.mockImplementation(() => mockDiscordUser);

    await discordSendTo('BalBalBlub', new TokenRequestMessage(), { key: 123123 });
    expect(mockDiscordUser.send).toHaveBeenCalled();
  });

});

describe('discord.ts discordPublish', () => {
  let spyDiscordClientChannels: jest.SpyInstance;
  beforeEach(() => {
    spyDiscordClientChannels = jest.spyOn(client.channels.cache, 'get');
  });

  it('should throw error if channel is not in cache', async () => {
    spyDiscordClientChannels.mockImplementation(() => null);
    const compareError = new Error(`Channel not in discord cache. Send a small 'test' message to the channel and try again.`);
    try {
      await discordPublish(new TokenRequestMessage(), { key: 123123 });
    } catch (error) {
      expect(error).toEqual(compareError);
    }
  });

  it('should send message if everything is fine', async () => {
    const mockDiscordChannel = { send: jest.fn() };
    spyDiscordClientChannels.mockImplementation(() => mockDiscordChannel);

    await discordPublish(new TokenRequestMessage(), { key: 123123 });
    expect(mockDiscordChannel.send).toHaveBeenCalled();
  });

});
