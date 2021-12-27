import { Message } from '../message.class';
import { t } from '../../../configuration/i18n';
export class AssignmentMessage extends Message {

  protected readonly markdownTemplate = [
    `**{{course}} - ${t('messages.assignment.title')}!**`,
    `ℹ️ "{{title}}" ${t('messages.assignment.description')}`,
    `⏰ ${t('messages.general.until')} \`{{dueDate}}\``
  ].join('\n');

  constructor(course: string, title: string, dueDate: string) {
    super();
    this.context = { course, title, dueDate };
  }
}
