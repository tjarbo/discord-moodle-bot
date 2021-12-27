import { Message } from '../message.class';
import { t } from '../../../configuration/i18n';

export class AssignmentReminderMessage extends Message {

  protected readonly markdownTemplate = [
    `**{{course}} - ${t('messages.assignmentReminder.title')}**:`,
    `⚠️ ${t('messages.assignmentReminder.markdown.description', '"{{title}}"')}!`
  ].join('\n');

  constructor(course: string, title: string) {
    super();
    this.context = { course, title };
  }
}
