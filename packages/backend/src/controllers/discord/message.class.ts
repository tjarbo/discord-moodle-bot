import { FMDBMessageTemplate } from './message.interface';

export class MessageTemplate implements FMDBMessageTemplate {

  readonly template: string;

  apply(options: any): string {
    const keys = Object.keys(options);
    let message = this.template;
    keys.forEach(key => {
      message = message.replace('{' + key + '}', options[key]);
    });
    return message;
  }
}
