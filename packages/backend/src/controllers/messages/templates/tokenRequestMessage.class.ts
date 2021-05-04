import { MessageTemplate } from '../message.class';

export interface TokenRequestMessageOptions {
  key: string;
}

export class TokenRequestMessage extends MessageTemplate {
  readonly template = `:key: **Es wurde ein Zugangstoken angefordert**
  Zugangstoken lautet: {key}
  Solltest du den Token nicht angefordert haben - Kein Problem, lösche diese Nachricht einfach!`;
}
