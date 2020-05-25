import { FMDBMessageTemplate } from './message.interface';

export class MessageTemplate implements FMDBMessageTemplate {

  readonly template: string;

  apply(options: any): string {
    const keys = Object.keys(options);
    const message = this.template;
    keys.forEach(key => {
      message.replace('{' + key + '}', options[key]);

    });
    return message;
  }
}