import { Message } from '../message.class';
import { t } from '../../../configuration/i18n';

export class AssignmentReminderMessage extends Message {

  protected markdownTemplate = `**{{course}} - ${t('messages.assignmentReminder.title')}**:
    ⚠️ ${t('messages.assignmentReminder.markdown.description', '"{{title}}"')}!`;

  protected context: any;

  constructor(course: string, title: string) {
    super();
    this.context = { course, title };
  }
}
