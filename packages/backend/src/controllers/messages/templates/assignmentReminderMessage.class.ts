import { MessageTemplate } from '../message.class';

export interface AssignmentReminderMessageOptions {
  course: string;
  title: string;
}

export class AssignmentReminderMessage extends MessageTemplate {
  readonly template = `**{course} - Erinnerung**:
  :warning: Abgabe von "{title}" **heute** fällig!`;
}
