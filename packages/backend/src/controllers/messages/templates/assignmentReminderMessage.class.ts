import { Message } from '../message.class';

export class AssignmentReminderMessage extends Message {

  protected markdownTemplate = {
    'EN': `**{{course}} - Reminder**:
    :warning: Submission of "{{title}}" **due today**!`,

    'DE': `**{{course}} - Erinnerung**:
    :warning: Abgabe von "{{title}}" **heute** fällig!`
  };

  protected context: any;

  constructor(course: string, title: string) {
    super();
    this.context = { course, title };
  }
}
