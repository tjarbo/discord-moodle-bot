import { Message } from '../message.class';
import { t } from '../../../configuration/i18n';
export class ResourceMessage extends Message {

  protected markdownTemplate =
   `**{{course}} - ${t('messages.resourceMessage.title')}**:
    📁 {{title}}
    🔗 {{link}}`;

  protected context: any;

  constructor(course: string, title: string, link: string) {
    super();
    this.context = { course, title, link };
  }
}
