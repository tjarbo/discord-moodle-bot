import { DiscordBotConnectorPlugin } from '../../../src/controllers/connectors/plugins/discordBot.class';

jest.mock('../../../src/configuration/environment.ts');

describe('connectors/plugins/discordBot.class.ts socketValidation', () => {
  let testSocket = {};

  beforeEach(() => testSocket = {});
  
  it('should fail on missing at creation', () => {
    testSocket = {
      token: "asdasd",
    }
    
    expect(DiscordBotConnectorPlugin.validateSocket.bind(DiscordBotConnectorPlugin, testSocket, true)).toThrowError()
  });

  it('should succeed on creation', () => {
    testSocket = {
      channel: "123456789123456789",
      token: "asdasd",
    }
    
    expect(DiscordBotConnectorPlugin.validateSocket.bind(DiscordBotConnectorPlugin, testSocket, true)).not.toThrowError()
  });

  it('should fail on wrong parameter at update', () => {
    testSocket = {
      channel: "123456789123456789",
      falseToken: "asdasd",
    }
    
    expect(DiscordBotConnectorPlugin.validateSocket.bind(DiscordBotConnectorPlugin, testSocket, false)).toThrowError()
  });

  it('should succeed on update', () => {
    testSocket = {
      token: "asdasd",
    }
    
    expect(DiscordBotConnectorPlugin.validateSocket.bind(DiscordBotConnectorPlugin, testSocket, false)).not.toThrowError()
  });
});