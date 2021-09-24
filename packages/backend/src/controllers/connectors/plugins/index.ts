export { DiscordBotConnectorPlugin } from './discordBot.class';
export { ConnectorPlugin } from './connectorPlugin.class';

export enum ConnectorType {
  Discord = 'discord',
}

export const ConnectorTypeValues = [ 'discord' ] as const;
